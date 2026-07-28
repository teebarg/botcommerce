from langchain_mcp_adapters.client import MultiServerMCPClient
from app.config import settings

mcp_client = MultiServerMCPClient({
    "revoque": {
        "url": settings.MCP_SERVER_URL,  # e.g. http://mcp:9000/mcp on your compose network
        "transport": "streamable_http",
    }
})

async def get_mcp_tools():
    return await mcp_client.get_tools()