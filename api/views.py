import os
import shutil
import time
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from email_validator import validate_email, EmailNotValidError
from ultralytics import YOLO
from prisma import Prisma
from collections import Counter
from datetime import datetime, timedelta
import asyncio

from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    SocialAuthSerializer,
    DetectionSerializer,
    UserProfileSerializer,
    UpdateProfileSerializer
)
from .utils import generate_gradcam, get_contextual_advice

# Initialize YOLO model
model = YOLO("yolo11n_openvino_model/", task="detect")

# Ensure media directory exists
UPLOAD_DIR = os.path.join(settings.MEDIA_ROOT, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_tokens_for_user(user_id, email):
    """Generate JWT tokens"""
    refresh = RefreshToken()
    refresh['user_id'] = user_id
    refresh['email'] = email

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def run_async(coro):
    """Helper to run async functions"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    # Validate email
    try:
        email_info = validate_email(data['email'], check_deliverability=True)
        valid_email = email_info.normalized
    except EmailNotValidError as e:
        return Response({"detail": f"Invalid or fake email: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    async def create_user():
        prisma = Prisma()
        await prisma.connect()

        # Check if user exists
        existing_user = await prisma.user.find_unique(where={'email': valid_email})
        if existing_user:
            await prisma.disconnect()
            return None

        # Create user
        user = await prisma.user.create(
            data={
                'firstName': data['first_name'],
                'lastName': data['last_name'],
                'email': valid_email,
                'password': data['password']
            }
        )
        await prisma.disconnect()
        return user

    user = run_async(create_user())

    if not user:
        return Response({"detail": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    async def authenticate_user():
        prisma = Prisma()
        await prisma.connect()

        user = await prisma.user.find_first(
            where={
                'email': data['email'],
                'password': data['password']
            }
        )
        await prisma.disconnect()
        return user

    user = run_async(authenticate_user())

    if not user:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = get_tokens_for_user(user.id, user.email)

    return Response({
        "message": "Login successful",
        "tokens": tokens,
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.firstName,
            "last_name": user.lastName
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Google OAuth endpoint"""
    serializer = SocialAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    async def get_or_create_user():
        prisma = Prisma()
        await prisma.connect()

        user = await prisma.user.find_unique(where={'email': data['email']})

        if not user:
            user = await prisma.user.create(
                data={
                    'firstName': data['first_name'],
                    'lastName': data['last_name'],
                    'email': data['email'],
                    'googleId': data['google_id'],
                    'password': 'GOOGLE_SOCIAL_USER'
                }
            )
        else:
            if not user.googleId:
                user = await prisma.user.update(
                    where={'id': user.id},
                    data={'googleId': data['google_id']}
                )

        await prisma.disconnect()
        return user

    user = run_async(get_or_create_user())
    tokens = get_tokens_for_user(user.id, user.email)

    return Response({
        "message": "Login successful",
        "tokens": tokens,
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.firstName,
            "last_name": user.lastName
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_image(request):
    """Image analysis endpoint"""
    file = request.FILES.get('file')
    email = request.data.get('email')

    if not file or not email:
        return Response({"detail": "File and email are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Save uploaded file
    ts = int(time.time())
    file_name = f"input_{ts}.jpg"
    heatmap_name = f"heatmap_{ts}.jpg"

    file_path = os.path.join(UPLOAD_DIR, file_name)
    heatmap_path = os.path.join(UPLOAD_DIR, heatmap_name)

    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    try:
        # Run YOLO detection
        results = model.predict(source=file_path, device='cpu', conf=0.25)
        label = results[0].names[int(results[0].boxes.cls[0])] if results[0].boxes else "Nothing detected"
        class_id = int(results[0].boxes.cls[0]) if results[0].boxes else None

        # Generate heatmap
        generate_gradcam(model, file_path, class_id=class_id, save_path=heatmap_path)

        # Get AI advice
        advice = get_contextual_advice(label)

        # Save to database
        async def save_detection():
            prisma = Prisma()
            await prisma.connect()

            user = await prisma.user.find_unique(where={'email': email})
            if not user:
                await prisma.disconnect()
                return None

            detection = await prisma.detection.create(
                data={
                    'objectName': label,
                    'advice': advice,
                    'imagePath': file_path,
                    'heatmapPath': heatmap_path,
                    'userId': user.id
                }
            )
            await prisma.disconnect()
            return detection

        detection = run_async(save_detection())

        if not detection:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Send email notification
        try:
            send_mail(
                subject=f'Detection Complete: {label}',
                message=f'Your image analysis is complete!\n\nDetected Object: {label}\n\nAdvice: {advice}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email send failed: {e}")

        return Response({
            "id": detection.id,
            "detected": label,
            "advice": advice,
            "heatmap_url": f"{settings.MEDIA_URL}uploads/{heatmap_name}",
            "original_url": f"{settings.MEDIA_URL}uploads/{file_name}"
        })

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_history(request):
    """Get detection history with search and filter"""
    email = request.query_params.get('email')
    search = request.query_params.get('search', '')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')

    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    async def fetch_history():
        prisma = Prisma()
        await prisma.connect()

        user = await prisma.user.find_unique(where={'email': email})
        if not user:
            await prisma.disconnect()
            return []

        where_clause = {'userId': user.id}

        # Apply search filter
        if search:
            where_clause['objectName'] = {'contains': search}

        # Apply date filter
        if date_from or date_to:
            where_clause['createdAt'] = {}
            if date_from:
                where_clause['createdAt']['gte'] = datetime.fromisoformat(date_from)
            if date_to:
                where_clause['createdAt']['lte'] = datetime.fromisoformat(date_to)

        detections = await prisma.detection.find_many(
            where=where_clause,
            order={'id': 'desc'}
        )
        await prisma.disconnect()
        return detections

    detections = run_async(fetch_history())

    return Response([{
        'id': d.id,
        'object_name': d.objectName,
        'advice': d.advice,
        'image_path': d.imagePath,
        'heatmap_path': d.heatmapPath,
        'created_at': d.createdAt.isoformat()
    } for d in detections])


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_history(request, item_id):
    """Delete a detection record"""
    async def delete_detection():
        prisma = Prisma()
        await prisma.connect()

        detection = await prisma.detection.find_unique(where={'id': item_id})
        if not detection:
            await prisma.disconnect()
            return None

        # Delete files
        try:
            if os.path.exists(detection.imagePath):
                os.remove(detection.imagePath)
            if os.path.exists(detection.heatmapPath):
                os.remove(detection.heatmapPath)
        except Exception as e:
            print(f"File deletion error: {e}")

        await prisma.detection.delete(where={'id': item_id})
        await prisma.disconnect()
        return True

    result = run_async(delete_detection())

    if not result:
        return Response({"detail": "Detection not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": "Detection deleted successfully"})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile(request):
    """Get user profile"""
    email = request.query_params.get('email')

    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    async def fetch_profile():
        prisma = Prisma()
        await prisma.connect()

        user = await prisma.user.find_unique(
            where={'email': email},
            include={'detections': True}
        )
        await prisma.disconnect()
        return user

    user = run_async(fetch_profile())

    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'id': user.id,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'createdAt': user.createdAt.isoformat(),
        'totalDetections': len(user.detections)
    })


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_profile(request):
    """Update user profile"""
    email = request.data.get('email')

    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UpdateProfileSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    async def update_user():
        prisma = Prisma()
        await prisma.connect()

        user = await prisma.user.find_unique(where={'email': email})
        if not user:
            await prisma.disconnect()
            return None

        update_data = {}
        if 'first_name' in data:
            update_data['firstName'] = data['first_name']
        if 'last_name' in data:
            update_data['lastName'] = data['last_name']
        if 'password' in data:
            update_data['password'] = data['password']

        updated_user = await prisma.user.update(
            where={'id': user.id},
            data=update_data
        )
        await prisma.disconnect()
        return updated_user

    user = run_async(update_user())

    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'message': 'Profile updated successfully',
        'user': {
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_stats(request):
    """Get detection statistics"""
    email = request.query_params.get('email')

    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    async def fetch_stats():
        prisma = Prisma()
        await prisma.connect()

        user = await prisma.user.find_unique(
            where={'email': email},
            include={'detections': True}
        )
        await prisma.disconnect()
        return user

    user = run_async(fetch_stats())

    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    detections = user.detections

    # Calculate statistics
    total_detections = len(detections)

    # Most common objects
    object_counts = Counter([d.objectName for d in detections])
    most_common = dict(object_counts.most_common(5))

    # Detections by date (last 7 days)
    today = datetime.now()
    date_counts = {}
    for i in range(7):
        date = today - timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        count = sum(1 for d in detections if d.createdAt.date() == date.date())
        date_counts[date_str] = count

    return Response({
        'totalDetections': total_detections,
        'mostCommonObjects': most_common,
        'detectionsByDate': date_counts,
        'recentDetections': total_detections
    })
