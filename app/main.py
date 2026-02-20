"""
FastAPI Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import db_service
from app.routes import auth_routes, detection_routes, subscription_routes, user_routes, admin_routes
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    # Startup
    await db_service.connect()
    print("✅ Database connected")
    yield
    # Shutdown
    await db_service.disconnect()
    print("🔌 Database disconnected")


# Create FastAPI app
app = FastAPI(
    title="Vision Flow Traffic AI",
    description="Traffic object detection and analysis API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure media directory exists and mount static files (local mode only)
MEDIA_DIR = os.path.join(os.getcwd(), 'media')
UPLOAD_DIR = os.path.join(MEDIA_DIR, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

if not settings.USE_CLOUDINARY:
    app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# Include routers
app.include_router(auth_routes.router, prefix="/api", tags=["Authentication"])
app.include_router(detection_routes.router, prefix="/api", tags=["Detection"])
app.include_router(user_routes.router, prefix="/api", tags=["User"])
app.include_router(subscription_routes.router, prefix="/api", tags=["Subscription"])
app.include_router(admin_routes.router, prefix="/api", tags=["Admin"])


@app.get("/")
async def root():
    return {
        "message": "Vision Flow Traffic AI API",
        "version": "2.0.0",
        "status": "active"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
