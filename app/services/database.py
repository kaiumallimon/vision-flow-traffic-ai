"""
Database service for Prisma operations
"""
from prisma import Prisma
from typing import Optional, List, Dict, Any
from datetime import datetime


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

    # User operations
    async def get_user_by_email(self, email: str, include_detections: bool = False):
        """Get user by email"""
        include_clause = {'detections': True} if include_detections else None
        return await self.prisma.user.find_unique(
            where={'email': email},
            include=include_clause
        )

    async def get_user_by_id(self, user_id: int):
        """Get user by ID"""
        return await self.prisma.user.find_unique(where={'id': user_id})

    async def create_user(self, first_name: str, last_name: str, email: str,
                         password: str, google_id: Optional[str] = None):
        """Create a new user"""
        data = {
            'firstName': first_name,
            'lastName': last_name,
            'email': email,
            'password': password
        }
        if google_id:
            data['googleId'] = google_id

        return await self.prisma.user.create(data=data)

    async def update_user(self, user_id: int, data: Dict[str, Any]):
        """Update user information"""
        return await self.prisma.user.update(
            where={'id': user_id},
            data=data
        )

    async def authenticate_user(self, email: str, password: str):
        """Authenticate user with email and password"""
        return await self.prisma.user.find_first(
            where={
                'email': email,
                'password': password
            }
        )

    # Detection operations
    async def create_detection(self, object_name: str, advice: str,
                              image_path: str, heatmap_path: str, user_id: int):
        """Create a new detection record"""
        return await self.prisma.detection.create(
            data={
                'objectName': object_name,
                'advice': advice,
                'imagePath': image_path,
                'heatmapPath': heatmap_path,
                'userId': user_id
            }
        )

    async def get_detections(self, user_id: int, search: Optional[str] = None,
                           date_from: Optional[datetime] = None,
                           date_to: Optional[datetime] = None) -> List:
        """Get user's detection history with optional filters"""
        where_clause = {'userId': user_id}

        if search:
            where_clause['objectName'] = {'contains': search}

        if date_from or date_to:
            where_clause['createdAt'] = {}
            if date_from:
                where_clause['createdAt']['gte'] = date_from
            if date_to:
                where_clause['createdAt']['lte'] = date_to

        return await self.prisma.detection.find_many(
            where=where_clause,
            order={'id': 'desc'}
        )

    async def get_detection_by_id(self, detection_id: int):
        """Get detection by ID"""
        return await self.prisma.detection.find_unique(
            where={'id': detection_id}
        )

    async def delete_detection(self, detection_id: int):
        """Delete a detection record"""
        return await self.prisma.detection.delete(where={'id': detection_id})


# Singleton instance
db_service = DatabaseService()
