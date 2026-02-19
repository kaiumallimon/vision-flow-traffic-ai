"""
Pydantic Models/Schemas for Request/Response
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# Auth Models
class UserRegister(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuth(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    google_id: str


class Token(BaseModel):
    access: str
    refresh: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.USER


class AuthResponse(BaseModel):
    message: str
    tokens: Token
    user: UserResponse


# Detection Models
class DetectionResponse(BaseModel):
    id: int
    detected: str
    advice: str
    heatmap_url: str
    original_url: str


class HistoryItem(BaseModel):
    id: int
    object_name: str
    advice: str
    image_path: str
    heatmap_path: str
    created_at: str


# User Profile Models
class UserProfile(BaseModel):
    id: int
    firstName: str
    lastName: str
    email: str
    role: UserRole = UserRole.USER
    createdAt: str
    totalDetections: int


class UpdateProfile(BaseModel):
    email: EmailStr
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=6)


# Stats Models
class StatsResponse(BaseModel):
    totalDetections: int
    mostCommonObjects: Dict[str, int]
    detectionsByDate: Dict[str, int]
    recentDetections: int


# Generic Response
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class SubscriptionStatusResponse(BaseModel):
    has_active_subscription: bool
    status: Optional[SubscriptionStatus] = None
    plan_name: Optional[str] = None
    start_at: Optional[str] = None
    end_at: Optional[str] = None
    api_key: Optional[str] = None


class PaymentOrderCreate(BaseModel):
    plan_name: str = Field(..., min_length=2, max_length=100)
    amount_bdt: float = Field(..., gt=0)
    bkash_number: str = Field(..., min_length=8, max_length=20)
    transaction_id: str = Field(..., min_length=5, max_length=100)
    user_note: Optional[str] = Field(None, max_length=500)


class PaymentOrderResponse(BaseModel):
    id: int
    plan_name: str
    amount_bdt: float
    currency: str
    bkash_number: str
    transaction_id: str
    status: OrderStatus
    user_note: Optional[str] = None
    admin_note: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: str
    updated_at: str


class AdminPaymentOrderResponse(PaymentOrderResponse):
    user_id: int
    user_email: str
    user_name: str


class AdminOrderReviewRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")
    admin_note: Optional[str] = Field(None, max_length=500)
    duration_days: int = Field(30, ge=1, le=365)


class ApiKeyResponse(BaseModel):
    key: str
    expires_at: str
