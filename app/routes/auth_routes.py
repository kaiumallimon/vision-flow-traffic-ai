"""
Authentication Routes (Controller)
"""
from fastapi import APIRouter, HTTPException, status
from email_validator import validate_email, EmailNotValidError

from app.models import (
    UserRegister, UserLogin, GoogleAuth,
    AuthResponse, MessageResponse, UserResponse, Token
)
from app.database import db_service
from app.services.auth import create_tokens

router = APIRouter()


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """User registration endpoint"""

    # Validate email
    try:
        email_info = validate_email(user_data.email, check_deliverability=True)
        valid_email = email_info.normalized
    except EmailNotValidError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or fake email: {str(e)}"
        )

    # Check if user exists
    existing_user = await db_service.get_user_by_email(valid_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    await db_service.create_user(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=valid_email,
        password=user_data.password
    )

    return MessageResponse(message="Registration successful")


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    """User login endpoint"""
    # Authenticate user
    user = await db_service.authenticate_user(
        email=credentials.email,
        password=credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate tokens
    tokens = create_tokens(user.id, user.email)

    return AuthResponse(
        message="Login successful",
        tokens=Token(**tokens),
        user=UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.firstName,
            last_name=user.lastName
        )
    )


@router.post("/auth/google", response_model=AuthResponse)
async def google_auth(google_data: GoogleAuth):
    """Google OAuth endpoint"""
    # Get or create user
    user = await db_service.get_user_by_email(google_data.email)

    if not user:
        user = await db_service.create_user(
            first_name=google_data.first_name,
            last_name=google_data.last_name,
            email=google_data.email,
            password='GOOGLE_SOCIAL_USER',
            google_id=google_data.google_id
        )
    else:
        if not user.googleId:
            user = await db_service.update_user(
                user_id=user.id,
                data={'googleId': google_data.google_id}
            )

    # Generate tokens
    tokens = create_tokens(user.id, user.email)

    return AuthResponse(
        message="Login successful",
        tokens=Token(**tokens),
        user=UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.firstName,
            last_name=user.lastName
        )
    )
