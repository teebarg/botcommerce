from fastapi import (
    APIRouter,
    Depends,
    Query,
    Request,
    Body,
)
from app.prisma_client import prisma as db
from prisma.enums import Role
from app.core.deps import get_current_superuser, RedisClient
from typing import Literal, Optional
from datetime import timedelta, datetime
from app.services.redis import cache_response, invalidate_list
from app.services.meilisearch import clear_index
from app.core.config import settings

router = APIRouter()

@router.get("/stats", dependencies=[Depends(get_current_superuser)])
async def admin_dashboard_stats():
    """Get admin dashboard stats"""
    orders_count = await db.order.count()

    orders = await db.order.find_many()
    total_revenue = sum(order.total for order in orders if order.total is not None)

    products_count = await db.product.count()

    users = await db.user.find_many(where={"role": Role.CUSTOMER})
    customers_count = len(users)

    return {
        "orders_count": orders_count,
        "total_revenue": total_revenue,
        "products_count": products_count,
        "customers_count": customers_count,
    }

@router.get("/stats/trends", dependencies=[Depends(get_current_superuser)])
@cache_response("stats-trends")
async def stats_trends(
    request: Request,
    range: Literal["day", "week", "month"] = Query("day"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    """Get admin dashboard stats trends"""
    now = datetime.now()
    start = start_date or now - timedelta(days=30)
    end = end_date or now

    previous_start = start - (end - start)
    previous_end = start

    group_by = {
        "day": "%Y-%m-%d",
        "week": "%Y-%W",
        "month": "%Y-%m"
    }[range]

    def group(items, field):
        counts = {}
        for item in items:
            key = item.created_at.strftime(field)
            counts[key] = counts.get(key, 0) + 1
        return counts

    current_orders = await db.order.find_many(where={"created_at": {"gte": start, "lte": end}})
    current_signups = await db.user.find_many(where={"role": Role.CUSTOMER, "created_at": {"gte": start, "lte": end}})

    prev_orders = await db.order.find_many(where={"created_at": {"gte": previous_start, "lt": previous_end}})
    prev_signups = await db.user.find_many(where={"role": Role.CUSTOMER, "created_at": {"gte": previous_start, "lt": previous_end}})

    # Grouped data
    order_grouped = group(current_orders, group_by)
    signup_grouped = group(current_signups, group_by)
    keys = sorted(set(order_grouped.keys()) | set(signup_grouped.keys()))
    trends = [
        {
            "date": key,
            "orders": order_grouped.get(key, 0),
            "signups": signup_grouped.get(key, 0)
        }
        for key in keys
    ]

    total_orders = len(current_orders)
    prev_orders_count = len(prev_orders)

    total_customers = len(current_signups)
    prev_customers_count = len(prev_signups)

    products_count = await db.product.count()

    current_revenue = sum(order.total for order in current_orders if order.total)
    prev_revenue = sum(order.total for order in prev_orders if order.total)

    def growth(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    summary = {
        "totalRevenue": current_revenue,
        "totalOrders": total_orders,
        "totalProducts": products_count,
        "totalCustomers": total_customers,
        "revenueGrowth": growth(current_revenue, prev_revenue),
        "ordersGrowth": growth(total_orders, prev_orders_count),
        "customersGrowth": growth(total_customers, prev_customers_count),
    }

    return {
        "summary": summary,
        "trends": trends
    }

@router.post("/cache/bust", dependencies=[Depends(get_current_superuser)])
async def bust_redis_cache(
    pattern: str = Body(..., embed=True, description="Key or pattern to delete from Redis cache"),
):
    """Bust Redis cache by key."""
    try:
        result = await invalidate_list(pattern)
        return {"success": result, "pattern": pattern}
    except Exception as e:
        return {"success": False, "error": str(e), "pattern": pattern}

@router.post("/cache/clear", dependencies=[Depends(get_current_superuser)])
async def clear_redis_cache(redis: RedisClient):
    """Clear the entire Redis database"""
    try:
        clear_index(settings.MEILI_PRODUCTS_INDEX)
        result = await redis.flushdb()
        return {"success": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
