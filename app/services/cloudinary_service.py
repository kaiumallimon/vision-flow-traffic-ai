"""
Cloudinary Service — upload and delete media files.
Only used when CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET are set.
Falls back to local /media/ serving when not configured.
"""
import cloudinary
import cloudinary.uploader
from app.config import settings


def _configure():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def upload_image(local_path: str, public_id: str, folder: str = "visionflow") -> str:
    """
    Upload a local file to Cloudinary.
    Returns the secure HTTPS URL.
    """
    _configure()
    result = cloudinary.uploader.upload(
        local_path,
        public_id=public_id,
        folder=folder,
        overwrite=True,
        resource_type="image",
    )
    return result["secure_url"]


def delete_image(public_id: str) -> None:
    """
    Delete an image from Cloudinary by its public_id.
    public_id should include the folder prefix, e.g. 'visionflow/input_1234'.
    """
    _configure()
    cloudinary.uploader.destroy(public_id, resource_type="image")


def extract_public_id(cloudinary_url: str) -> str:
    """
    Derive the Cloudinary public_id from a secure URL.
    e.g. https://res.cloudinary.com/<cloud>/image/upload/v.../visionflow/input_123.jpg
         → visionflow/input_123
    """
    # Strip version segment and extension
    # URL pattern: .../upload/v<version>/<folder>/<name>.<ext>
    try:
        upload_index = cloudinary_url.index("/upload/") + len("/upload/")
        path = cloudinary_url[upload_index:]
        # Remove version token (v1234567890/)
        if path.startswith("v") and "/" in path:
            path = path.split("/", 1)[1]
        # Remove file extension
        if "." in path:
            path = path.rsplit(".", 1)[0]
        return path
    except Exception:
        return ""
