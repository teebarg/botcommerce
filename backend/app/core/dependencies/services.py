from fastapi import Depends
from app.prisma_client import prisma as db_client
from app.services.gallery import GalleryService

def get_gallery_service() -> GalleryService:
    """Dependency Provider returning clean configured instance scopes."""
    return GalleryService(db_client=db_client)