# import os
# from langchain_openai import ChatOpenAI
# from langchain_community.chat_models import ChatOllama

# def get_llm():
#     provider: str = os.getenv("LLM_PROVIDER", "ollama")

#     if provider == "openai":
#         return ChatOpenAI(
#             model="gpt-4o-mini",
#             temperature=0,
#         )

#     elif provider == "ollama":
#         return ChatOllama(
#             model="llama3",
#             temperature=0,
#         )

#     else:
#         raise ValueError("Invalid LLM_PROVIDER")

import os
from llama_cpp import Llama

_llm_instance = None  # singleton instance

def get_llm():
    """
    Returns a singleton instance of a small quantized Llama 2 7B model.
    Optimized for Render 500MB RAM.
    """
    global _llm_instance
    if _llm_instance is not None:
        return _llm_instance

    # Path to your 4-bit quantized GGUF model
    model_path = os.getenv("LLAMA_MODEL_PATH", "llama2-7b-chat.gguf")

    _llm_instance = Llama(
        model_path=model_path,
        n_ctx=2048,    # context window
        n_threads=2    # reduce threads for RAM
    )

    return _llm_instance