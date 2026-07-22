import json
from typing import Optional
from app.db import get_pool
from app.server import mcp

@mcp.tool()
async def search_products(
    query: Optional[str] = None,
    limit: int = 10,
    only_active: bool = True
) -> str:
    """Search and list products with variants using optimized raw SQL."""
    pool = get_pool()

    # Raw SQL fetch using PostgreSQL JSON aggregation in 1 round trip
    sql = """
        SELECT
            p.id,
            p.name,
            p.sku,
            p.active,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', v.id,
                        'price', v.price,
                        'inventory', v.inventory,
                        'status', v.status
                    )
                ) FILTER (WHERE v.id IS NOT NULL), '[]'
            ) AS variants
        FROM products p
        LEFT JOIN product_variants v ON v.product_id = p.id
        WHERE ($1::boolean IS FALSE OR p.active = TRUE)
          AND ($2::text IS NULL OR p.name ILIKE '%' || $2 || '%' OR p.sku ILIKE '%' || $2 || '%')
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT $3;
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, only_active, query, limit)

    results = [dict(row) for row in rows]
    return json.dumps(results, indent=2, default=str)


async def update_variant_inventory(variant_id: int, new_inventory: int) -> str:
    """Update inventory count using raw SQL RETURNING clause."""
    pool = get_pool()
    status = "IN_STOCK" if new_inventory > 0 else "OUT_OF_STOCK"

    sql = """
        UPDATE product_variants
        SET inventory = $1, status = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, inventory, status;
    """

    async with pool.acquire() as conn:
        row = await conn.fetchrow(sql, new_inventory, status, variant_id)

    if not row:
        return f"Error: Variant with ID {variant_id} not found."

    return f"Updated variant {row['id']} stock to {row['inventory']} ({row['status']})."