"""
Admin-only Routes: stats and user management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.database import db_service
from app.models import (
    AdminStatsResponse,
    AdminUserResponse,
    UpdateUserRoleRequest,
    MessageResponse,
    TokenData,
)
from app.services.auth import require_admin

router = APIRouter()


@router.get("/admin/stats", response_model=AdminStatsResponse)
async def get_admin_stats(current_user: TokenData = Depends(require_admin)):
    """System-wide statistics for the admin dashboard"""
    stats = await db_service.get_admin_stats()
    return AdminStatsResponse(**stats)


@router.get("/admin/users", response_model=List[AdminUserResponse])
async def get_all_users(current_user: TokenData = Depends(require_admin)):
    """List all users with subscription info"""
    users = await db_service.get_all_users()
    result = []
    for user in users:
        # Find the active subscription if any
        active_sub = next(
            (
                s
                for s in (user.subscriptions or [])
                if s.isActive and s.status == "ACTIVE"
            ),
            None,
        )
        result.append(
            AdminUserResponse(
                id=user.id,
                email=user.email,
                first_name=user.firstName,
                last_name=user.lastName,
                role=user.role,
                created_at=user.createdAt.isoformat() if user.createdAt else None,
                total_detections=len(user.detections) if user.detections else 0,
                has_active_subscription=active_sub is not None,
                subscription_plan=active_sub.planName if active_sub else None,
                daily_limit=active_sub.dailyLimit if active_sub else None,
                daily_used=active_sub.dailyUsedToday if active_sub else None,
            )
        )
    return result


@router.patch("/admin/users/{user_id}/role", response_model=MessageResponse)
async def update_user_role(
    user_id: int,
    payload: UpdateUserRoleRequest,
    current_user: TokenData = Depends(require_admin),
):
    """Update a user's role (ADMIN/USER)"""
    user = await db_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prevent an admin from demoting themselves
    if str(user_id) == current_user.user_id and payload.role.value == "USER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot demote your own admin account.",
        )

    await db_service.update_user_role(user_id, payload.role.value)
    return MessageResponse(message=f"User role updated to {payload.role.value}.")
