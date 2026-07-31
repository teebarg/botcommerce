from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    BROKER_URL: str = "redis://localhost:6379/0"
    PORT: int = 10000
    ENVIRONMENT: str = "development"

    WORKER_ENABLED: bool = False
    CRON_JOBS_ENABLED: bool = False
    EMBEDDINGS_ENABLED: bool = False

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    SLACK_WEBHOOK_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

settings = Settings()
