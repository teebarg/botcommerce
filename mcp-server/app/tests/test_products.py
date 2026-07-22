import pytest

@pytest.mark.asyncio
async def test_search_products(mcp_client, mock_backend):
    mock_backend.search_products.return_value = [{"id": 1, "name": "Red Ankara Dress"}]
    result = await mcp_client.call_tool("search_products", {"query": "red dress"})
    assert result.data
    mock_backend.search_products.assert_awaited_once_with("red dress")
    