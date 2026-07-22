from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async def sanity_check():
    async with streamablehttp_client("http://localhost:8787/mcp") as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print([t.name for t in tools.tools])
            result = await session.call_tool("search_products", {"query": "red dress"})
            print(result)