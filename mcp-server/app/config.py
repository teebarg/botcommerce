from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    backend_url: str = "http://backend:8000"
    DATABASE_URL: str = ""

    api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()