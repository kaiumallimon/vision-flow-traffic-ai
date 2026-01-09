"""
User Profile and Stats Routes (Controller)
"""
from fastapi import APIRouter, HTTPException, status, Query
from collections import Counter
from datetime import datetime, timedelta

from app.models import UserProfile, UpdateProfile, StatsResponse, MessageResponse
from app.database import db_service

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(email: str = Query(...)):
    """Get user profile"""
    user = await db_service.get_user_by_email(email, include_detections=True)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserProfile(
        id=user.id,
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email,
        createdAt=user.createdAt.isoformat(),
        totalDetections=len(user.detections) if user.detections else 0
    )


@router.put("/profile/update", response_model=MessageResponse)
async def update_profile(profile_data: UpdateProfile):
    """Update user profile"""
    user = await db_service.get_user_by_email(profile_data.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prepare update data
    update_data = {}
    if profile_data.first_name:
        update_data['firstName'] = profile_data.first_name
    if profile_data.last_name:
        update_data['lastName'] = profile_data.last_name
    if profile_data.password:
        update_data['password'] = profile_data.password

    # Update user
    await db_service.update_user(user.id, update_data)

    return MessageResponse(message="Profile updated successfully")


@router.get("/stats", response_model=StatsResponse)
async def get_stats(email: str = Query(...)):
    """Get detection statistics"""
    user = await db_service.get_user_by_email(email, include_detections=True)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    detections = user.detections if user.detections else []

    # Calculate statistics
    total_detections = len(detections)

    # Most common objects
    object_counts = Counter([d.objectName for d in detections])
    most_common = dict(object_counts.most_common(5))

    # Detections by date (last 30 days for better analytics)
    today = datetime.now()
    date_counts = {}
    for i in range(30):
        date = today - timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        count = sum(1 for d in detections if d.createdAt.date() == date.date())
        date_counts[date_str] = count

    return StatsResponse(
        totalDetections=total_detections,
        mostCommonObjects=most_common,
        detectionsByDate=date_counts,
        recentDetections=total_detections
    )
