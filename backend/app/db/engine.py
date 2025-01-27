from sqlmodel import create_engine

from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,  # Test connection before using it
    pool_recycle=3600,   # Recycle connections after 1 hour
)
