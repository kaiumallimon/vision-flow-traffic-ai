"""
Subscription, API key and payment order routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional

from app.database import db_service
from app.models import (
    AdminOrderReviewRequest,
    AdminPaymentOrderResponse,
    ApiKeyResponse,
    MessageResponse,
    OrderStatus,
    PaymentOrderCreate,
    PaymentOrderResponse,
    PlanInfo,
    PlansResponse,
    SubscriptionStatusResponse,
    PLAN_CONFIG,
)
from app.services.auth import get_current_user, require_admin
from app.models import TokenData

router = APIRouter()


def mask_bkash(number: str) -> str:
    if not number:
        return ""
    if len(number) <= 4:
        return number
    return f"{'*' * (len(number) - 4)}{number[-4:]}"


def map_order_response(order) -> PaymentOrderResponse:
    return PaymentOrderResponse(
        id=order.id,
        plan_name=order.planName,
        amount_bdt=order.amountBdt,
        currency=order.currency,
        bkash_number=mask_bkash(order.bkashNumber),
        transaction_id=order.transactionId,
        status=OrderStatus(order.status),
        user_note=order.userNote,
        admin_note=order.adminNote,
        reviewed_at=order.reviewedAt.isoformat() if order.reviewedAt else None,
        created_at=order.createdAt.isoformat() if order.createdAt else None,
        updated_at=order.updatedAt.isoformat() if order.updatedAt else None,
    )


# ------------------------------------------------------------------ #
#  Subscription plans                                                  #
# ------------------------------------------------------------------ #

@router.get("/subscription/plans", response_model=PlansResponse)
async def get_subscription_plans():
    """Return all available subscription plans with pricing"""
    plans = [
        PlanInfo(
            name=k,
            label=v["label"],
            daily_limit=v["daily_limit"],
            price_bdt=v["price_bdt"],
            description=v["description"],
        )
        for k, v in PLAN_CONFIG.items()
    ]
    return PlansResponse(plans=plans)


# ------------------------------------------------------------------ #
#  User subscription routes                                            #
# ------------------------------------------------------------------ #

@router.get("/subscription/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(current_user: TokenData = Depends(get_current_user)):
    user = await db_service.get_user_by_email(current_user.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    subscription = await db_service.get_active_subscription(user.id)
    if not subscription:
        return SubscriptionStatusResponse(has_active_subscription=False)

    return SubscriptionStatusResponse(
        has_active_subscription=True,
        status=subscription.status,
        plan_name=subscription.planName,
        daily_limit=subscription.dailyLimit,
        daily_used=subscription.dailyUsedToday,
        start_at=subscription.startAt.isoformat(),
        end_at=subscription.endAt.isoformat(),
        api_key=subscription.apiKey.key if subscription.apiKey else None,
    )


@router.get("/subscription/api-key", response_model=ApiKeyResponse)
async def get_api_key(current_user: TokenData = Depends(get_current_user)):
    user = await db_service.get_user_by_email(current_user.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    api_key = await db_service.get_user_api_key(user.id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active API key. Complete payment and wait for admin approval.",
        )

    return ApiKeyResponse(key=api_key.key, expires_at=api_key.expiresAt.isoformat())


@router.post("/orders", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_order(
    payload: PaymentOrderCreate,
    current_user: TokenData = Depends(get_current_user),
):
    user = await db_service.get_user_by_email(current_user.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Validate plan name
    if payload.plan_name.lower() not in PLAN_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan. Choose from: {', '.join(PLAN_CONFIG.keys())}",
        )

    existing_tx = await db_service.get_order_by_transaction_id(payload.transaction_id)
    if existing_tx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction ID already submitted",
        )

    await db_service.create_payment_order(
        user_id=user.id,
        plan_name=payload.plan_name.lower(),
        amount_bdt=payload.amount_bdt,
        bkash_number=payload.bkash_number,
        transaction_id=payload.transaction_id,
        user_note=payload.user_note,
    )

    return MessageResponse(message="Payment order submitted. Waiting for admin review.")


@router.get("/orders/me", response_model=List[PaymentOrderResponse])
async def get_my_orders(current_user: TokenData = Depends(get_current_user)):
    user = await db_service.get_user_by_email(current_user.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    orders = await db_service.get_user_orders(user.id)
    return [map_order_response(order) for order in orders]


# ------------------------------------------------------------------ #
#  Admin order routes                                                  #
# ------------------------------------------------------------------ #

@router.get("/admin/orders", response_model=List[AdminPaymentOrderResponse])
async def get_admin_orders(
    current_user: TokenData = Depends(require_admin),
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
):
    orders = await db_service.get_orders(status_filter.value if status_filter else None)
    return [
        AdminPaymentOrderResponse(
            **map_order_response(order).model_dump(),
            user_id=order.user.id,
            user_email=order.user.email,
            user_name=f"{order.user.firstName} {order.user.lastName}".strip(),
        )
        for order in orders
    ]


@router.patch("/admin/orders/{order_id}/review", response_model=MessageResponse)
async def review_order(
    order_id: int,
    payload: AdminOrderReviewRequest,
    current_user: TokenData = Depends(require_admin),
):
    if payload.action == "approve":
        result = await db_service.approve_order(
            order_id=order_id,
            admin_note=payload.admin_note,
        )
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        if isinstance(result, dict) and result.get("error"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

        return MessageResponse(message="Order approved. Subscription and API key activated for 30 days.")

    result = await db_service.reject_order(order_id=order_id, admin_note=payload.admin_note)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return MessageResponse(message="Order rejected.")
