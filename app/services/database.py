"""
Database service — asyncpg (replaces Prisma)
Tables already exist in Neon (created when Prisma was used).
Table names are PascalCase quoted because that's what Prisma created.
"""
import asyncpg
import os
import secrets
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from types import SimpleNamespace

from app.models import PLAN_DAILY_LIMIT


def _row(record) -> Optional[SimpleNamespace]:
    if record is None:
        return None
    return SimpleNamespace(**dict(record))


def _rows(records) -> List[SimpleNamespace]:
    return [_row(r) for r in records]


class DatabaseService:
    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if self._pool is None:
            self._pool = await asyncpg.create_pool(
                dsn=os.environ["DATABASE_URL"],
                min_size=1,
                max_size=5,
                statement_cache_size=0,
            )

    async def disconnect(self):
        if self._pool:
            await self._pool.close()
            self._pool = None

    async def _fetch_one(self, query: str, *args):
        async with self._pool.acquire() as conn:
            return _row(await conn.fetchrow(query, *args))

    async def _fetch_all(self, query: str, *args):
        async with self._pool.acquire() as conn:
            return _rows(await conn.fetch(query, *args))

    async def _execute(self, query: str, *args):
        async with self._pool.acquire() as conn:
            return await conn.execute(query, *args)

    async def _fetchval(self, query: str, *args):
        async with self._pool.acquire() as conn:
            return await conn.fetchval(query, *args)

    # ── User ──────────────────────────────────────────────────────────────

    async def get_user_by_email(self, email: str, include_detections: bool = False):
        return await self._fetch_one('SELECT * FROM "User" WHERE email=$1', email)

    async def get_user_by_id(self, user_id: int):
        return await self._fetch_one('SELECT * FROM "User" WHERE id=$1', user_id)

    async def create_user(self, first_name, last_name, email, password,
                          google_id=None, role="USER"):
        return await self._fetch_one(
            '''INSERT INTO "User"("firstName","lastName",email,password,"googleId",role,"createdAt")
               VALUES($1,$2,$3,$4,$5,$6::\"UserRole\",NOW()) RETURNING *''',
            first_name, last_name, email, password, google_id, role
        )

    async def update_user(self, user_id: int, data: Dict[str, Any]):
        sets, vals = [], []
        col_map = {"firstName":"firstName","lastName":"lastName",
                   "email":"email","password":"password","role":"role"}
        for k, v in data.items():
            col = col_map.get(k, k)
            vals.append(v)
            sets.append(f'"{col}"=${len(vals)}')
        vals.append(user_id)
        return await self._fetch_one(
            f'UPDATE "User" SET {", ".join(sets)} WHERE id=${len(vals)} RETURNING *', *vals)

    async def authenticate_user(self, email: str, password: str):
        return await self._fetch_one(
            'SELECT * FROM "User" WHERE email=$1 AND password=$2', email, password)

    async def update_user_role(self, user_id: int, role: str):
        return await self._fetch_one(
            'UPDATE "User" SET role=$1::\"UserRole\" WHERE id=$2 RETURNING *', role, user_id)

    # ── Detection ─────────────────────────────────────────────────────────

    async def create_detection(self, object_name, advice, image_path, heatmap_path, user_id):
        return await self._fetch_one(
            '''INSERT INTO "Detection"("objectName",advice,"imagePath","heatmapPath","userId","createdAt")
               VALUES($1,$2,$3,$4,$5,NOW()) RETURNING *''',
            object_name, advice, image_path, heatmap_path, user_id)

    async def get_detections(self, user_id, search=None, date_from=None, date_to=None):
        conds = ['"userId"=$1']
        vals = [user_id]
        if search:
            vals.append(f"%{search}%"); conds.append(f'"objectName" ILIKE ${len(vals)}')
        if date_from:
            vals.append(date_from); conds.append(f'"createdAt">=${len(vals)}')
        if date_to:
            vals.append(date_to); conds.append(f'"createdAt"<=${len(vals)}')
        return await self._fetch_all(
            f'SELECT * FROM "Detection" WHERE {" AND ".join(conds)} ORDER BY id DESC', *vals)

    async def get_detection_by_id(self, detection_id: int):
        return await self._fetch_one('SELECT * FROM "Detection" WHERE id=$1', detection_id)

    async def delete_detection(self, detection_id: int):
        await self._execute('DELETE FROM "Detection" WHERE id=$1', detection_id)

    # ── Subscription ──────────────────────────────────────────────────────

    async def get_active_subscription(self, user_id: int):
        return await self._fetch_one(
            '''SELECT * FROM "Subscription"
               WHERE "userId"=$1 AND "isActive"=TRUE
                 AND status='ACTIVE'::"SubscriptionStatus" AND "endAt">$2
               LIMIT 1''',
            user_id, datetime.utcnow())

    async def has_active_subscription(self, user_id: int) -> bool:
        return (await self.get_active_subscription(user_id)) is not None

    async def check_and_increment_daily_usage(self, user_id: int) -> dict:
        sub = await self.get_active_subscription(user_id)
        if not sub:
            return {"allowed": False, "used": 0, "limit": 0, "reason": "no_subscription"}

        today = datetime.utcnow().date()
        last = sub.lastUsageDate
        if last is None or (hasattr(last, "date") and last.date() < today):
            await self._execute(
                'UPDATE "Subscription" SET "dailyUsedToday"=1,"lastUsageDate"=$1 WHERE id=$2',
                datetime.utcnow(), sub.id)
            return {"allowed": True, "used": 1, "limit": sub.dailyLimit, "reason": None}

        if sub.dailyUsedToday >= sub.dailyLimit:
            return {"allowed": False, "used": sub.dailyUsedToday,
                    "limit": sub.dailyLimit, "reason": "daily_limit_reached"}

        await self._execute(
            'UPDATE "Subscription" SET "dailyUsedToday"="dailyUsedToday"+1 WHERE id=$1', sub.id)
        return {"allowed": True, "used": sub.dailyUsedToday+1,
                "limit": sub.dailyLimit, "reason": None}

    async def get_user_api_key(self, user_id: int):
        return await self._fetch_one(
            '''SELECT * FROM "ApiKey"
               WHERE "userId"=$1 AND "isActive"=TRUE AND "expiresAt">$2
               ORDER BY id DESC LIMIT 1''',
            user_id, datetime.utcnow())

    # ── Payment orders ────────────────────────────────────────────────────

    async def create_payment_order(self, user_id, plan_name, amount_bdt,
                                    bkash_number, transaction_id, user_note=None):
        return await self._fetch_one(
            '''INSERT INTO "PaymentOrder"
               ("planName","amountBdt",currency,"bkashNumber","transactionId",
                status,"userNote","userId","createdAt","updatedAt")
               VALUES($1,$2,'BDT',$3,$4,'PENDING'::"OrderStatus",$5,$6,NOW(),NOW())
               RETURNING *''',
            plan_name, amount_bdt, bkash_number, transaction_id, user_note, user_id)

    async def get_order_by_transaction_id(self, transaction_id: str):
        return await self._fetch_one(
            'SELECT * FROM "PaymentOrder" WHERE "transactionId"=$1', transaction_id)

    async def get_user_orders(self, user_id: int):
        return await self._fetch_all(
            'SELECT * FROM "PaymentOrder" WHERE "userId"=$1 ORDER BY id DESC', user_id)

    def _attach_user(self, row):
        if row:
            row.user = SimpleNamespace(
                firstName=row.firstName, lastName=row.lastName, email=row.user_email)
        return row

    async def get_orders(self, status=None):
        q = '''SELECT o.*,u."firstName",u."lastName",u.email as user_email
               FROM "PaymentOrder" o JOIN "User" u ON o."userId"=u.id'''
        rows = (await self._fetch_all(q + ' WHERE o.status=$1::"OrderStatus" ORDER BY o.id DESC', status)
                if status else await self._fetch_all(q + ' ORDER BY o.id DESC'))
        return [self._attach_user(r) for r in rows]

    async def get_order_by_id(self, order_id: int):
        row = await self._fetch_one(
            '''SELECT o.*,u."firstName",u."lastName",u.email as user_email
               FROM "PaymentOrder" o JOIN "User" u ON o."userId"=u.id WHERE o.id=$1''',
            order_id)
        return self._attach_user(row)

    async def approve_order(self, order_id: int, admin_note=None):
        order = await self.get_order_by_id(order_id)
        if not order: return None
        if order.status != "PENDING": return {"error": "Order already reviewed"}

        now = datetime.utcnow()
        expires_at = now + timedelta(days=30)
        daily_limit = PLAN_DAILY_LIMIT.get(order.planName.lower(), 10)

        async with self._pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute(
                    'UPDATE "Subscription" SET "isActive"=FALSE,status=\'EXPIRED\'::"SubscriptionStatus" WHERE "userId"=$1 AND "isActive"=TRUE',
                    order.userId)
                await conn.execute(
                    'UPDATE "ApiKey" SET "isActive"=FALSE WHERE "userId"=$1 AND "isActive"=TRUE',
                    order.userId)

                api_key = _row(await conn.fetchrow(
                    'INSERT INTO "ApiKey"(key,"isActive","createdAt","expiresAt","userId") VALUES($1,TRUE,NOW(),$2,$3) RETURNING *',
                    f"vf_{secrets.token_urlsafe(32)}", expires_at, order.userId))

                subscription = _row(await conn.fetchrow(
                    '''INSERT INTO "Subscription"("planName",status,"isActive","dailyLimit","dailyUsedToday","startAt","endAt","createdAt","updatedAt","userId","apiKeyId")
                       VALUES($1,'ACTIVE'::"SubscriptionStatus",TRUE,$2,0,$3,$4,NOW(),NOW(),$5,$6) RETURNING *''',
                    order.planName, daily_limit, now, expires_at, order.userId, api_key.id))

                updated_order = _row(await conn.fetchrow(
                    'UPDATE "PaymentOrder" SET status=\'APPROVED\'::"OrderStatus","adminNote"=$1,"reviewedAt"=$2,"subscriptionId"=$3,"updatedAt"=NOW() WHERE id=$4 RETURNING *',
                    admin_note, now, subscription.id, order.id))

        return {"order": updated_order, "subscription": subscription, "api_key": api_key}

    async def reject_order(self, order_id: int, admin_note=None):
        order = await self.get_order_by_id(order_id)
        if not order: return None
        if order.status != "PENDING": return {"error": "Order already reviewed"}
        return await self._fetch_one(
            'UPDATE "PaymentOrder" SET status=\'REJECTED\'::"OrderStatus","adminNote"=$1,"reviewedAt"=$2,"updatedAt"=NOW() WHERE id=$3 RETURNING *',
            admin_note, datetime.utcnow(), order_id)

    # ── Admin ─────────────────────────────────────────────────────────────

    async def get_admin_stats(self) -> dict:
        return {
            "total_users":          int(await self._fetchval('SELECT COUNT(*) FROM "User"')),
            "total_detections":     int(await self._fetchval('SELECT COUNT(*) FROM "Detection"')),
            "total_revenue_bdt":    float(await self._fetchval('SELECT COALESCE(SUM("amountBdt"),0) FROM "PaymentOrder" WHERE status=\'APPROVED\'::"OrderStatus"')),
            "pending_orders":       int(await self._fetchval('SELECT COUNT(*) FROM "PaymentOrder" WHERE status=\'PENDING\'::"OrderStatus"')),
            "active_subscriptions": int(await self._fetchval('SELECT COUNT(*) FROM "Subscription" WHERE "isActive"=TRUE AND status=\'ACTIVE\'::"SubscriptionStatus"')),
        }

    async def get_all_users(self, skip: int = 0, limit: int = 100):
        users = await self._fetch_all(
            'SELECT * FROM "User" ORDER BY id DESC OFFSET $1 LIMIT $2', skip, limit)
        for user in users:
            user.subscriptions = await self._fetch_all(
                'SELECT * FROM "Subscription" WHERE "userId"=$1', user.id)
            user.detections = await self._fetch_all(
                'SELECT id FROM "Detection" WHERE "userId"=$1', user.id)
        return users


db_service = DatabaseService()
