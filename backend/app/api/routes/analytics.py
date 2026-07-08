from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from app.core.dependencies.cache import CacheDep

router = APIRouter()

FUNNELS: dict[str, list[str]] = {
    "push": [
        "push_prompt_shown",
        "push_dismissed_backdrop",
        "push_dismissed_not_now",
        "push_cta_clicked",
        "push_unsupported_browser",
        "push_already_blocked",
        "push_permission_granted",
        "push_permission_denied",
        "push_subscribed",
        "push_sync_failed",
        "push_subscribe_failed",
    ],
    "sales": [
        "product_viewed",
        "product_added_to_cart",
        "cart_viewed",
        "checkout_started",
        "checkout_address_submitted",
        "checkout_payment_submitted",
        "order_placed",
    ],
}

COUNTER_TTL_SECONDS: int = 30 * 24 * 60 * 60

def _total_key(event: str) -> str:
    return f"analytics:event:{event}:total"
 
def _daily_key(event: str, date_str: str) -> str:
    return f"analytics:event:{event}:{date_str}"


class EventIn(BaseModel):
    event: str
    session_id: str
    url: str | None = None
    meta: dict[str, Any] | None = None
    ts: str | None = None


@router.post("/event", status_code=204)
async def record_event(payload: EventIn, cache_srv: CacheDep, background_tasks: BackgroundTasks):
    async def log_event():
        try:
            date_str: str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            daily_key: str = _daily_key(payload.event, date_str)
            async with cache_srv.redis.pipeline(transaction=False) as pipe:
                pipe.incr(_total_key(payload.event))
                pipe.incr(daily_key)
                pipe.expire(daily_key, COUNTER_TTL_SECONDS)
                await pipe.execute()
        except Exception:
            pass
        return
    background_tasks.add_task(log_event)


@router.get("/funnel/{name}")
async def funnel(cache_srv: CacheDep, name: str):
    """
    All-time counts per event in the named funnel (see FUNNELS above),
    plus conversion between each consecutive step and overall
    first-step -> last-step conversion.
    """
    events: list[str] | None = FUNNELS.get(name)
    if not events:
        return {"error": f"Unknown funnel '{name}'. Known funnels: {list(FUNNELS)}"}
 
    keys: list[str] = [_total_key(e) for e in events]
    values = await cache_srv.redis.mget(keys)
    counts = {event: int(v or 0) for event, v in zip(events, values)}
 
    steps = []
    for i, event in enumerate(events):
        step = {"event": event, "count": counts[event]}
        if i > 0:
            prev_count = counts[events[i - 1]]
            step["conversion_from_previous"] = (
                round(counts[event] / prev_count, 3) if prev_count else None
            )
        steps.append(step)
 
    first, last = counts[events[0]], counts[events[-1]]
    return {
        "funnel": name,
        "steps": steps,
        "overall_conversion": round(last / first, 3) if first else None,
    }
 
 
@router.get("/funnel/{name}/daily")
async def funnel_daily(cache_srv: CacheDep, name: str, days: int = 7):
    """Per-day counts for the named funnel (max 30 — older days expire)."""
    events: list[str] | None = FUNNELS.get(name)
    if not events:
        return {"error": f"Unknown funnel '{name}'. Known funnels: {list(FUNNELS)}"}
 
    today = datetime.now(timezone.utc).date()
    dates: list[str] = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
 
    result = []
    for date_str in dates:
        keys: list[str] = [_daily_key(e, date_str) for e in events]
        values = await cache_srv.redis.mget(keys)
        result.append({
            "date": date_str,
            "counts": {event: int(v or 0) for event, v in zip(events, values)},
        })
 
    return result
