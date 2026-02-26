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

    redis_url: str = Field(default="redis://localhost:6379", alias="REDIS_URL")

    api_base_url: str = Field(alias="API_BASE_URL")

    agent_max_iterations: int = Field(default=6, alias="AGENT_MAX_ITERATIONS")
    agent_verbose: bool = Field(default=True, alias="AGENT_VERBOSE")

    class Config:
        env_file = ".env"
        populate_by_name = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()

from langchain_google_genai import ChatGoogleGenerativeAI

def get_llm():
    from langchain_cerebras import ChatCerebras
    settings = get_settings()
    return ChatCerebras(
        model="gpt-oss-120b",
        cerebras_api_key="csk-fwrp924y5v5jx82d4m3tw3c4vfkpwv5vd5552ptdxyhhde44",
        temperature=0,
    )

def get_llm1():
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key="AIzaSyBDcGBDgTcjkeLIkNzorIOYESP7vxrN9Do",
        temperature=0,
        max_retries=0,
    )

def get_llm2():
    from langchain_groq import ChatGroq
    settings = get_settings()
    print(f"[LLM] Using Groq → {settings.groq_model}")
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.groq_api_key,
        temperature=0.2,
        max_tokens=1024,
    )


# config.py
def get_llm():
    provider = settings.LLM_PROVIDER  # "groq" | "gemini" | "cerebras"
    
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
    else:  # groq (default)
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=settings.GROQ_MODEL,
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0,
        )
