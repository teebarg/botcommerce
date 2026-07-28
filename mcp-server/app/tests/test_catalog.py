import pytest

@pytest.mark.asyncio
async def test_query_products_filters_active(mcp_client):
    result = await mcp_client.call_tool("query_products", {"query": "dress", "limit": 5})
    data = result.data  # already JSON via json.dumps in your tool
    assert isinstance(data, list)
    assert all(p["active"] for p in data)