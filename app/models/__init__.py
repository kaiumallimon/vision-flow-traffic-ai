"""
Pydantic Models/Schemas for Request/Response
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List
from datetime import datetime


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
