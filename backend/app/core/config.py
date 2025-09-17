from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    EmailStr,
    HttpUrl,
    PostgresDsn,
    ValidationInfo,
    computed_field,
    field_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    ACCESS_TOKEN_EXPIRE_MINUTES: int = (
        60 * 24 * 8
    )  # 60 minutes * 24 hours * 8 days = 8 days
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "specialsecret"

    DATABASE_URL: str = ""

    PAYSTACK_SECRET_KEY: str = "Pk_test_5029925955255255"

    DOMAIN: str = "localhost"
    FRONTEND_HOST: str = "http://localhost:3000"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    @computed_field  # type: ignore[misc]
    @property
    def server_host(self) -> str:
        # Use HTTPS for anything other than local development
        if self.ENVIRONMENT == "local":
            return f"http://{self.DOMAIN}"
        return f"https://{self.DOMAIN}"

    EMAIL_TEST_USER: EmailStr = "test@example.com"  # type: ignore
    FIRST_SUPERUSER_FIRSTNAME: str = "admin"
    FIRST_SUPERUSER_LASTNAME: str = "admin"
    FIRST_SUPERUSER: EmailStr = "admin@email.com"
    FIRST_SUPERUSER_PASSWORD: str = "password"

    REDIS_URL: str = "redis://localhost:6379/0"
    SENTRY_DSN: HttpUrl | None = None

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "your-password"

    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: str | None = None
    EMAILS_ENABLED: bool = False

    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost"]'
    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = (
        []
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    RABBITMQ_HOST: str = "rabbitmq"

    MEILI_MASTER_KEY: str = "masterKey"
    MEILI_HOST: str = "http://meilisearch:7700"
    MEILI_PRODUCTS_INDEX: str = "products"
    MEILI_GALLERY_INDEX: str = "gallery"

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    SLACK_ALERTS: str = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    SLACK_ORDERS: str = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

    # WhatsApp Business (Cloud API)
    WHATSAPP_TOKEN: str | None = None
    WHATSAPP_PHONE_NUMBER_ID: str | None = None

    # OAuth Settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    GEMINI_API_KEY: str = ""

    GOOGLE_SPREADSHEET_ID: str = ""
    GOOGLE_GID: str = ""

    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_PRIVATE_KEY: str = ""

    model_config = SettingsConfigDict(
        # Use top level .env file (one level above ./backend/)
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )


settings = Settings()
