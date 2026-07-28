import pytest

@pytest.mark.asyncio
async def test_get_order_not_found(mcp_client, mock_backend):
    mock_backend.get_order.side_effect = Exception("404")
    result = await mcp_client.call_tool("get_order", {"order_number": "nonexistent"})
    assert result.is_error