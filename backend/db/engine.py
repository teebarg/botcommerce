from sqlmodel import create_engine

from core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
