import pytest
from fastmcp import Client
from app.server import mcp  # your FastMCP instance

@pytest.mark.asyncio
async def test_search_products_returns_results():
    async with Client(mcp) as client:
        result = await client.call_tool("search_products", {"query": "red ankara dress"})
        assert result.data  # or however your tool shapes its return
        assert len(result.data) > 0

@pytest.mark.asyncio
async def test_search_products_empty_query():
    async with Client(mcp) as client:
        result = await client.call_tool("search_products", {"query": ""})
        # decide + assert the actual contract: empty list? error? all products?

@pytest.mark.asyncio
async def test_check_stock_invalid_product_id():
    async with Client(mcp) as client:
        result = await client.call_tool("check_stock", {"product_id": "nonexistent"})
        assert result.is_error or result.data.get("in_stock") is False


@pytest.mark.asyncio
async def test_search_products_via_container():
    async with Client("http://localhost:8000/mcp") as client:
        result = await client.call_tool("search_products", {"query": "red ankara dress"})
        assert result.data