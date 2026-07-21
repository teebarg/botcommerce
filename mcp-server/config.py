from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    backend_url: str = "http://backend:8000"

    api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()