import pytest
from unittest.mock import AsyncMock
import app.main  # side-effect import: registers all @mcp.tool() functions
from app.server import mcp
from app.backend import backend

@pytest.fixture
def mock_backend(monkeypatch):
    mock = AsyncMock()
    monkeypatch.setattr(backend, "search_products", mock.search_products)
    monkeypatch.setattr(backend, "get_order", mock.get_order)
    return mock

@pytest.fixture
async def mcp_client():
    from fastmcp import Client
    async with Client(mcp) as client:
        yield client