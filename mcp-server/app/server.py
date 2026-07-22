from contextlib import asynccontextmanager
from fastmcp import FastMCP
from app.db import db

@asynccontextmanager
async def lifespan(app):
    await db.connect()
    print("Database initialized")

    yield

    await db.disconnect()
    print("Database closed")

mcp = FastMCP(name="Revoque MCP Server", lifespan=lifespan)