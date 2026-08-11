from core.config import BaseAppSettings

class Settings(BaseAppSettings):
    API_BASE_URL: str = "http://backend:8000"
    SECRET_KEY: str ="specialsecret"


settings = Settings()