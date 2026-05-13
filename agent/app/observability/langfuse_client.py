"""
app/observability/langfuse_client.py
Langfuse v4 — context-manager / OTel based SDK.
"""
from __future__ import annotations
import logging
from functools import lru_cache
from langfuse import Langfuse, get_client, propagate_attributes

from app.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_langfuse() -> Langfuse | None:
    pk   = settings.LANGFUSE_PUBLIC_KEY
    sk   = settings.LANGFUSE_SECRET_KEY
    host = settings.LANGFUSE_BASE_URL
    if not pk or not sk:
        logger.warning("[Langfuse] Credentials missing — observability disabled.")
        return None
    try:
        client = Langfuse(public_key=pk, secret_key=sk, host=host)
        logger.debug(f"[Langfuse] Connected → {host}")
        return client
    except Exception as exc:
        logger.error(f"[Langfuse] Init failed: {exc}")
        return None


def flush_langfuse() -> None:
    client = get_langfuse()
    if client:
        try:
            client.flush()
        except Exception:
            pass


def create_trace(name, session_id=None, user_id=None, metadata=None, tags=None, input=None):
    client = get_langfuse()
    if not client:
        return _NoOpTrace()
    try:
        # v4: start_observation() with as_type= (not type=)
        # propagate_attributes sets session_id/user_id/tags on the OTel context
        obs = client.start_observation(
            name=name,
            as_type="span",
            input=input,
            metadata=metadata or {},
        )
        # Attach trace-level correlating attributes via propagate_attributes
        # We store them on the adapter so start_turn_trace can enter the context
        return _TraceAdapter(
            client=client,
            obs=obs,
            session_id=session_id,
            user_id=str(user_id) if user_id else None,
            tags=tags or [],
        )
    except Exception as exc:
        logger.error(f"[Langfuse] create_trace: {exc}")
        return _NoOpTrace()


class _TraceAdapter:
    """Wraps a v4 root observation to expose the v2-style trace interface."""

    def __init__(self, client: Langfuse, obs, session_id=None, user_id=None, tags=None):
        self._client     = client
        self._obs        = obs
        self._session_id = session_id
        self._user_id    = user_id
        self._tags       = tags or []
        self.id          = getattr(obs, "trace_id", None) or getattr(obs, "id", "noop")

    def span(self, name: str, input=None, metadata=None, **__) -> "_SpanAdapter":
        try:
            child = self._obs.start_observation(
                name=name,
                as_type="span",
                input=input,
                metadata=metadata or {},
            )
            return _SpanAdapter(child)
        except Exception as exc:
            logger.debug(f"[Langfuse] span error: {exc}")
            return _NoOpSpan()

    def generation(self, name: str, model=None, usage=None, input=None,
                   output=None, metadata=None, **__) -> "_SpanAdapter":
        try:
            child = self._obs.start_observation(
                name=name,
                as_type="generation",
                model=model,
                input=input,
                output=output,
                usage_details=usage,
                metadata=metadata or {},
            )
            child.end()
            return _SpanAdapter(child)
        except Exception as exc:
            logger.debug(f"[Langfuse] generation error: {exc}")
            return _NoOpSpan()

    def score(self, name: str, value: float, comment: str = "", **__) -> None:
        try:
            self._client.create_score(
                trace_id=self.id,
                name=name,
                value=value,
                comment=comment,
            )
        except Exception as exc:
            logger.debug(f"[Langfuse] score error: {exc}")

    def update(self, output=None, metadata=None, **__) -> None:
        try:
            self._obs.update(output=output, metadata=metadata)
        except Exception as exc:
            logger.debug(f"[Langfuse] trace.update error: {exc}")


class _SpanAdapter:
    def __init__(self, obs):
        self._obs = obs
        self.id   = getattr(obs, "id", "noop")

    def end(self, output=None, metadata=None, level=None, **__) -> None:
        try:
            kwargs = {}
            if output is not None:  kwargs["output"]   = output
            if metadata is not None: kwargs["metadata"] = metadata
            if level is not None:   kwargs["level"]    = level
            self._obs.end(**kwargs)
        except Exception as exc:
            logger.debug(f"[Langfuse] span.end error: {exc}")

    def update(self, **kwargs) -> None:
        try:
            self._obs.update(**kwargs)
        except Exception as exc:
            logger.debug(f"[Langfuse] span.update error: {exc}")

    def generation(self, *_, **__): return _NoOpSpan()
    def span(self, *_, **__):       return _NoOpSpan()
    def score(self, *_, **__):      pass


class _NoOpTrace:
    id = "noop"
    def span(self, *_, **__):       return _NoOpSpan()
    def generation(self, *_, **__): return _NoOpSpan()
    def score(self, *_, **__):      pass
    def update(self, *_, **__):     pass


class _NoOpSpan:
    id = "noop"
    def end(self, *_, **__):        pass
    def update(self, *_, **__):     pass
    def generation(self, *_, **__): return _NoOpSpan()
    def span(self, *_, **__):       return _NoOpSpan()
    def score(self, *_, **__):      pass