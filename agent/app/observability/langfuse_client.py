"""
app/observability/langfuse_client.py
Langfuse singleton + no-op stubs so the app never crashes when
observability credentials are missing.
"""
from __future__ import annotations
import logging
from functools import lru_cache
from langfuse import Langfuse
from app.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_langfuse() -> Langfuse | None:
    """Return shared Langfuse client, or None if creds are missing."""
    pk  = settings.LANGFUSE_PUBLIC_KEY
    sk  = settings.LANGFUSE_SECRET_KEY
    host = settings.LANGFUSE_BASE_URL
    if not pk or not sk:
        logger.warning("[Langfuse] Credentials missing — observability disabled.")
        return None
    try:
        client = Langfuse(public_key=pk, secret_key=sk, host=host, debug=False)
        logger.info(f"[Langfuse] Connected → {host}")
        return client
    except Exception as exc:
        logger.error(f"[Langfuse] Init failed: {exc}")
        return None


def flush_langfuse() -> None:
    client = get_langfuse()
    if client:
        try: client.flush()
        except: pass


def create_trace(name, session_id=None, user_id=None, metadata=None, tags=None, input=None):
    client = get_langfuse()
    if not client: return _NoOpTrace()
    try:
        return client.trace(
            name=name, session_id=session_id,
            user_id=str(user_id) if user_id else None,
            metadata=metadata or {}, tags=tags or [], input=input,
        )
    except Exception as exc:
        logger.debug(f"[Langfuse] create_trace: {exc}")
        return _NoOpTrace()


class _NoOpTrace:
    id = "noop"
    def span(self, *_, **__): return _NoOpSpan()
    def generation(self, *_, **__): return _NoOpSpan()
    def score(self, *_, **__): pass
    def update(self, *_, **__): pass

class _NoOpSpan:
    id = "noop"
    def end(self, *_, **__): pass
    def update(self, *_, **__): pass
    def generation(self, *_, **__): return _NoOpSpan()
    def span(self, *_, **__): return _NoOpSpan()
    def score(self, *_, **__): pass
