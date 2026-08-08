from typing import Any, Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class BaseAppSettings(BaseSettings):
    """Shared settings used across both API and Worker services."""
    
    # Environment & System
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    DATABASE_URL: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"
    BROKER_URL: str = "redis://localhost:6379/0"
    INTERNAL_WORKER_SECRET: str = "secret"

    # AI & Search
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Storage
    DEFAULT_STORAGE_PROVIDER: Literal["supabase", "r2"] = "supabase"
    STORAGE_BUCKET: str = "images-dev"

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    CLOUDINARY_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    CLOUDFLARE_ACCOUNT_ID: str = ""
    CLOUDFLARE_R2_ACCESS_KEY_ID: str = ""
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: str = ""
    CLOUDFLARE_R2_PUBLIC_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )