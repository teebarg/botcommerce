from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    env: str = Field(default="development", alias="ENV")
    DATABASE_URL: str = ""

    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="llama3", alias="OLLAMA_MODEL")

    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama3-8b-8192", alias="GROQ_MODEL")

    qdrant_url: str = Field(alias="QDRANT_URL")
    qdrant_api_key: str = Field(alias="QDRANT_API_KEY")

    redis_url: str = Field(default="redis://localhost:6379", alias="REDIS_URL")

    api_base_url: str = Field(alias="API_BASE_URL")
    api_key: str = Field(alias="API_KEY")

    # Agent
    agent_max_iterations: int = Field(default=6, alias="AGENT_MAX_ITERATIONS")
    agent_verbose: bool = Field(default=True, alias="AGENT_VERBOSE")

    class Config:
        env_file = ".env"
        populate_by_name = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def get_llm():
    """
    LLM factory — returns the right LLM based on environment.
    Swapping models is a one-line env var change.
    Both Ollama & Groq use OpenAI-compatible format via LangChain.
    """
    from langchain_groq import ChatGroq
    print(f"[LLM] Using Groq → {settings.groq_model}")
    return ChatGroq(
        model=settings.groq_model,
        api_key=settings.groq_api_key,
        temperature=0.2,        # lower = more factual, better for support
        max_tokens=1024,
    )
    # settings = get_settings()

    # if settings.env == "production":
    #     from langchain_groq import ChatGroq
    #     print(f"[LLM] Using Groq → {settings.groq_model}")
    #     return ChatGroq(
    #         model=settings.groq_model,
    #         api_key=settings.groq_api_key,
    #         temperature=0.2,        # lower = more factual, better for support
    #         max_tokens=1024,
    #     )
    # else:
    #     from langchain_community.llms import Ollama
    #     print(f"[LLM] Using Ollama → {settings.ollama_model}")
    #     return Ollama(
    #         model=settings.ollama_model,
    #         base_url=settings.ollama_base_url,
    #         temperature=0.2,
    #     )
