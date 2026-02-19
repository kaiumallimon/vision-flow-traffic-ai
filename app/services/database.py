"""
Database service for Prisma operations
"""
from prisma import Prisma
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import secrets

from app.models import PLAN_DAILY_LIMIT


class DatabaseService:
    """Service class for database operations"""

    def __init__(self):
        self.prisma = Prisma()

    async def connect(self):
        """Connect to database"""
        if not self.prisma.is_connected():
            await self.prisma.connect()

    async def disconnect(self):
        """Disconnect from database"""
        await self.prisma.disconnect()

    # ------------------------------------------------------------------ #
    #  User operations                                                     #
    # ------------------------------------------------------------------ #

    async def get_user_by_email(self, email: str, include_detections: bool = False):
        """Get user by email"""
        include_clause = {"detections": True} if include_detections else None
        return await self.prisma.user.find_unique(
            where={"email": email},
            include=include_clause,
        )

    async def get_user_by_id(self, user_id: int):
        """Get user by ID"""
        return await self.prisma.user.find_unique(where={"id": user_id})

    async def create_user(
        self,
        first_name: str,
        last_name: str,
        email: str,
        password: str,
        google_id: Optional[str] = None,
        role: str = "USER",
    ):
        """Create a new user"""
        data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "password": password,
            "role": role,
        }
        if google_id:
            data["googleId"] = google_id

        return await self.prisma.user.create(data=data)

    async def update_user(self, user_id: int, data: Dict[str, Any]):
        """Update user information"""
        return await self.prisma.user.update(
            where={"id": user_id},
            data=data,
        )

    async def authenticate_user(self, email: str, password: str):
        """Authenticate user with email and password"""
        return await self.prisma.user.find_first(
            where={"email": email, "password": password}
        )

    async def update_user_role(self, user_id: int, role: str):
        """Update user role"""
        return await self.prisma.user.update(
            where={"id": user_id},
            data={"role": role},
        )

    # ------------------------------------------------------------------ #
    #  Detection operations                                                #
    # ------------------------------------------------------------------ #

    async def create_detection(
        self,
        object_name: str,
        advice: str,
        image_path: str,
        heatmap_path: str,
        user_id: int,
    ):
        """Create a new detection record"""
        return await self.prisma.detection.create(
            data={
                "objectName": object_name,
                "advice": advice,
                "imagePath": image_path,
                "heatmapPath": heatmap_path,
                "userId": user_id,
            }
        )

    async def get_detections(
        self,
        user_id: int,
        search: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> List:
        """Get user's detection history with optional filters"""
        where_clause = {"userId": user_id}

        if search:
            where_clause["objectName"] = {"contains": search}

        if date_from or date_to:
            where_clause["createdAt"] = {}
            if date_from:
                where_clause["createdAt"]["gte"] = date_from
            if date_to:
                where_clause["createdAt"]["lte"] = date_to

        return await self.prisma.detection.find_many(
            where=where_clause,
            order={"id": "desc"},
        )

    async def get_detection_by_id(self, detection_id: int):
        """Get detection by ID"""
        return await self.prisma.detection.find_unique(where={"id": detection_id})

    async def delete_detection(self, detection_id: int):
        """Delete a detection record"""
        return await self.prisma.detection.delete(where={"id": detection_id})

    # ------------------------------------------------------------------ #
    #  Subscription operations                                             #
    # ------------------------------------------------------------------ #

    async def get_active_subscription(self, user_id: int):
        """Get active subscription for user"""
        now = datetime.utcnow()
        return await self.prisma.subscription.find_first(
            where={
                "userId": user_id,
                "isActive": True,
                "status": "ACTIVE",
                "endAt": {"gt": now},
            },
            include={"apiKey": True},
        )

    async def has_active_subscription(self, user_id: int) -> bool:
        """Check if user has active subscription"""
        subscription = await self.get_active_subscription(user_id)
        return subscription is not None

    async def check_and_increment_daily_usage(self, user_id: int) -> dict:
        """
        Check whether today's analysis count is within the daily limit.
        Resets the counter automatically when a new UTC day starts.
        Returns {"allowed": bool, "used": int, "limit": int, "reason": str|None}
        """
        subscription = await self.get_active_subscription(user_id)
        if not subscription:
            return {"allowed": False, "used": 0, "limit": 0, "reason": "no_subscription"}

        today = datetime.utcnow().date()
        last_used = subscription.lastUsageDate

        # Reset counter if it's a new day
        if last_used is None or last_used.date() < today:
            await self.prisma.subscription.update(
                where={"id": subscription.id},
                data={
                    "dailyUsedToday": 1,
                    "lastUsageDate": datetime.utcnow(),
                },
            )
            return {
                "allowed": True,
                "used": 1,
                "limit": subscription.dailyLimit,
                "reason": None,
            }

        # Check limit
        if subscription.dailyUsedToday >= subscription.dailyLimit:
            return {
                "allowed": False,
                "used": subscription.dailyUsedToday,
                "limit": subscription.dailyLimit,
                "reason": "daily_limit_reached",
            }

        # Increment
        await self.prisma.subscription.update(
            where={"id": subscription.id},
            data={"dailyUsedToday": {"increment": 1}},
        )
        return {
            "allowed": True,
            "used": subscription.dailyUsedToday + 1,
            "limit": subscription.dailyLimit,
            "reason": None,
        }

    async def get_user_api_key(self, user_id: int):
        """Get active API key for user"""
        now = datetime.utcnow()
        return await self.prisma.apiKey.find_first(
            where={
                "userId": user_id,
                "isActive": True,
                "expiresAt": {"gt": now},
            },
            order={"id": "desc"},
        )

    # ------------------------------------------------------------------ #
    #  Payment order operations                                            #
    # ------------------------------------------------------------------ #

    async def create_payment_order(
        self,
        user_id: int,
        plan_name: str,
        amount_bdt: float,
        bkash_number: str,
        transaction_id: str,
        user_note: Optional[str] = None,
    ):
        """Create a payment order"""
        return await self.prisma.paymentorder.create(
            data={
                "planName": plan_name,
                "amountBdt": amount_bdt,
                "currency": "BDT",
                "bkashNumber": bkash_number,
                "transactionId": transaction_id,
                "status": "PENDING",
                "userNote": user_note,
                "userId": user_id,
            }
        )

    async def get_order_by_transaction_id(self, transaction_id: str):
        """Get payment order by transaction ID"""
        return await self.prisma.paymentorder.find_unique(
            where={"transactionId": transaction_id}
        )

    async def get_user_orders(self, user_id: int):
        """Get orders for a specific user"""
        return await self.prisma.paymentorder.find_many(
            where={"userId": user_id},
            order={"id": "desc"},
        )

    async def get_orders(self, status: Optional[str] = None):
        """Get all payment orders, optionally by status"""
        where_clause = {"status": status} if status else None
        return await self.prisma.paymentorder.find_many(
            where=where_clause,
            include={"user": True},
            order={"id": "desc"},
        )

    async def get_order_by_id(self, order_id: int):
        """Get payment order by ID"""
        return await self.prisma.paymentorder.find_unique(
            where={"id": order_id},
            include={"user": True},
        )

    async def approve_order(self, order_id: int, admin_note: Optional[str]):
        """
        Approve order and activate subscription with API key.
        Always grants 30 days; daily limit is determined by the plan name.
        """
        order = await self.get_order_by_id(order_id)
        if not order:
            return None

        if order.status != "PENDING":
            return {"error": "Order already reviewed"}

        now = datetime.utcnow()
        duration_days = 30
        expires_at = now + timedelta(days=duration_days)

        # Determine daily limit from plan name (case-insensitive)
        plan_key = order.planName.lower()
        daily_limit = PLAN_DAILY_LIMIT.get(plan_key, 10)

        # Deactivate existing subscriptions/API keys
        await self.prisma.subscription.update_many(
            where={"userId": order.userId, "isActive": True},
            data={"isActive": False, "status": "EXPIRED"},
        )
        await self.prisma.apikey.update_many(
            where={"userId": order.userId, "isActive": True},
            data={"isActive": False},
        )

        # Create new API key
        raw_key = f"vf_{secrets.token_urlsafe(32)}"
        api_key = await self.prisma.apikey.create(
            data={
                "key": raw_key,
                "isActive": True,
                "expiresAt": expires_at,
                "userId": order.userId,
            }
        )

        # Create new subscription with daily limit
        subscription = await self.prisma.subscription.create(
            data={
                "planName": order.planName,
                "status": "ACTIVE",
                "isActive": True,
                "dailyLimit": daily_limit,
                "dailyUsedToday": 0,
                "startAt": now,
                "endAt": expires_at,
                "userId": order.userId,
                "apiKeyId": api_key.id,
            }
        )

        # Update order status
        updated_order = await self.prisma.paymentorder.update(
            where={"id": order.id},
            data={
                "status": "APPROVED",
                "adminNote": admin_note,
                "reviewedAt": now,
                "subscriptionId": subscription.id,
            },
            include={"user": True},
        )

        return {
            "order": updated_order,
            "subscription": subscription,
            "api_key": api_key,
        }

    async def reject_order(self, order_id: int, admin_note: Optional[str]):
        """Reject payment order"""
        order = await self.get_order_by_id(order_id)
        if not order:
            return None

        if order.status != "PENDING":
            return {"error": "Order already reviewed"}

        return await self.prisma.paymentorder.update(
            where={"id": order.id},
            data={
                "status": "REJECTED",
                "adminNote": admin_note,
                "reviewedAt": datetime.utcnow(),
            },
            include={"user": True},
        )

    # ------------------------------------------------------------------ #
    #  Admin operations                                                    #
    # ------------------------------------------------------------------ #

    async def get_admin_stats(self) -> dict:
        """Get system-wide statistics for the admin dashboard"""
        total_users = await self.prisma.user.count()
        total_detections = await self.prisma.detection.count()
        pending_orders = await self.prisma.paymentorder.count(
            where={"status": "PENDING"}
        )
        active_subscriptions = await self.prisma.subscription.count(
            where={"isActive": True, "status": "ACTIVE"}
        )

        approved_orders = await self.prisma.paymentorder.find_many(
            where={"status": "APPROVED"}
        )
        total_revenue = sum(o.amountBdt for o in approved_orders)

        return {
            "total_users": total_users,
            "total_detections": total_detections,
            "total_revenue_bdt": total_revenue,
            "pending_orders": pending_orders,
            "active_subscriptions": active_subscriptions,
        }

    async def get_all_users(self, skip: int = 0, limit: int = 100):
        """Get all users with subscription and detection counts for admin"""
        return await self.prisma.user.find_many(
            skip=skip,
            take=limit,
            include={"subscriptions": True, "detections": True},
            order={"id": "desc"},
        )


# Singleton instance
db_service = DatabaseService()
