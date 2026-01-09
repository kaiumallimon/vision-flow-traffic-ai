"""
Global database service instance
"""
from app.services.database import DatabaseService

# Global database service instance - shared across the application
db_service = DatabaseService()
