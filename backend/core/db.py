from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from supabase import Client, create_client

from core.config import settings


@lru_cache()
def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


Supabase = Annotated[Client, Depends(get_supabase_client)]

db = get_supabase_client()
