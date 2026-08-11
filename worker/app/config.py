from core.config import BaseAppSettings

class Settings(BaseAppSettings):
    API_BASE_URL: str = "http://backend:8000"
    PORT: int = 10000

    WORKER_ENABLED: bool = False
    CRON_JOBS_ENABLED: bool = False
    EMBEDDINGS_ENABLED: bool = False

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

settings = Settings()
