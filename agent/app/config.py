from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    env: str = Field(default="development", alias="ENV")
    DATABASE_URL: str = ""
    SECRET_KEY: str = "specialsecret"
    LLM_PROVIDER: str = Field(default="groq", alias="LLM_PROVIDER")
    CEREBRAS_API_KEY: str = Field(default="", alias="CEREBRAS_API_KEY")
    GOOGLE_API_KEY: str = Field(default="", alias="GOOGLE_API_KEY")

    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.3-70b-versatile", alias="GROQ_MODEL")

    qdrant_url: str = Field(alias="QDRANT_URL")
    qdrant_api_key: str = Field(alias="QDRANT_API_KEY")

    REDIS_URL: str = Field(default="redis://localhost:6379")

    API_BASE_URL: str = Field(default="http://localhost:8000")

    agent_max_iterations: int = Field(default=6, alias="AGENT_MAX_ITERATIONS")
    agent_verbose: bool = Field(default=True, alias="AGENT_VERBOSE")

    class Config:
        env_file = ".env"
        populate_by_name = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def get_llm():
    settings = get_settings()
    provider: str = settings.LLM_PROVIDER  # "groq" | "gemini" | "cerebras"

    if provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0,
            max_retries=0,
        )
    elif provider == "cerebras":
        from langchain_cerebras import ChatCerebras
        return ChatCerebras(
            model="llama-3.3-70b",
            cerebras_api_key=settings.CEREBRAS_API_KEY,
            temperature=0,
        )
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(
            # model="llama3.2:3b",
            # model="llama3:latest",
            model="qwen2.5:3b",
            base_url="http://ollama:11434",
            temperature=0,
        )
    else:
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=settings.GROQ_MODEL,
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0,
            max_tokens=1024,
        )
