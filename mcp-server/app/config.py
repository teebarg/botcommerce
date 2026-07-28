from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BACKEND_URL: str = "http://backend:8000"
    DATABASE_URL: str = ""
    SECRET_KEY: str ="specialsecret"

    class Config:
        env_file = ".env"


settings = Settings()