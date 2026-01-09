"""
Detection Routes (Controller)
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Query
from typing import Optional, List
import os
import time
import shutil
from datetime import datetime
from ultralytics import YOLO

from app.models import DetectionResponse, HistoryItem, MessageResponse
from app.database import db_service
from app.utils import generate_gradcam, get_contextual_advice
from app.config import settings
from app.services.email import send_detection_email

router = APIRouter()

# Initialize YOLO model
model = YOLO(settings.YOLO_MODEL_PATH, task="detect")

# Ensure upload directory exists
UPLOAD_DIR = os.path.join(settings.MEDIA_ROOT, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze", response_model=DetectionResponse)
async def analyze_image(
    file: UploadFile = File(...),
    email: str = Form(...)
):
    """Image analysis endpoint"""

    if not file or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File and email are required"
        )

    # Save uploaded file
    ts = int(time.time())
    file_name = f"input_{ts}.jpg"
    heatmap_name = f"heatmap_{ts}.jpg"

    file_path = os.path.join(UPLOAD_DIR, file_name)
    heatmap_path = os.path.join(UPLOAD_DIR, heatmap_name)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Run YOLO detection
        results = model.predict(source=file_path, device='cpu', conf=settings.CONFIDENCE_THRESHOLD)
        label = results[0].names[int(results[0].boxes.cls[0])] if results[0].boxes else "Nothing detected"
        class_id = int(results[0].boxes.cls[0]) if results[0].boxes else None

        # Generate heatmap
        generate_gradcam(model, file_path, class_id=class_id, save_path=heatmap_path)

        # Get AI advice
        advice = get_contextual_advice(label)

        # Get user
        user = await db_service.get_user_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Save detection
        detection = await db_service.create_detection(
            object_name=label,
            advice=advice,
            image_path=f"/media/uploads/{file_name}",
            heatmap_path=f"/media/uploads/{heatmap_name}",
            user_id=user.id
        )

        # Send email notification
        user_name = f"{user.firstName} {user.lastName}".strip() or "User"
        await send_detection_email(
            user_email=email,
            user_name=user_name,
            detected_object=label,
            advice=advice
        )

        return DetectionResponse(
            id=detection.id,
            detected=label,
            advice=advice,
            heatmap_url=f"{settings.MEDIA_URL}uploads/{heatmap_name}",
            original_url=f"{settings.MEDIA_URL}uploads/{file_name}"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in analyze_image: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/history", response_model=List[HistoryItem])
async def get_history(
    email: str = Query(...),
    search: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """Get detection history with search and filter"""
    # Get user
    user = await db_service.get_user_by_email(email)
    if not user:
        return []

    # Parse dates if provided
    date_from_obj = datetime.fromisoformat(date_from) if date_from else None
    date_to_obj = datetime.fromisoformat(date_to) if date_to else None

    # Get detections
    detections = await db_service.get_detections(
        user_id=user.id,
        search=search,
        date_from=date_from_obj,
        date_to=date_to_obj
    )

    return [
        HistoryItem(
            id=d.id,
            object_name=d.objectName,
            advice=d.advice,
            image_path=d.imagePath,
            heatmap_path=d.heatmapPath,
            created_at=d.createdAt.isoformat()
        )
        for d in detections
    ]


@router.delete("/history/{item_id}", response_model=MessageResponse)
async def delete_history(item_id: int):
    """Delete a detection record"""
    # Get detection
    detection = await db_service.get_detection_by_id(item_id)
    if not detection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection not found"
        )

    # Delete files
    try:
        if os.path.exists(detection.imagePath):
            os.remove(detection.imagePath)
        if os.path.exists(detection.heatmapPath):
            os.remove(detection.heatmapPath)
    except Exception as e:
        print(f"File deletion error: {e}")

    # Delete from database
    await db_service.delete_detection(item_id)

    return MessageResponse(message="Detection deleted successfully")


@router.delete("/history/bulk", response_model=MessageResponse)
async def bulk_delete_history(
    item_ids: List[int],
    email: str = Query(...)
):
    """Bulk delete detection records"""
    # Verify user
    user = await db_service.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    deleted_count = 0
    for item_id in item_ids:
        detection = await db_service.get_detection_by_id(item_id)
        if detection and detection.userId == user.id:
            # Delete files
            try:
                if detection.imagePath and not detection.imagePath.startswith('/media/'):
                    if os.path.exists(detection.imagePath):
                        os.remove(detection.imagePath)
                if detection.heatmapPath and not detection.heatmapPath.startswith('/media/'):
                    if os.path.exists(detection.heatmapPath):
                        os.remove(detection.heatmapPath)
            except Exception as e:
                print(f"File deletion error: {e}")

            # Delete from database
            await db_service.delete_detection(item_id)
            deleted_count += 1

    return MessageResponse(message=f"Successfully deleted {deleted_count} detection(s)")
