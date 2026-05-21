from __future__ import annotations
import json
from app.logging import get_logger
from app.config import get_llm
from langchain_core.messages import HumanMessage, SystemMessage

logger = get_logger(__name__)

_MARKETING_SYSTEM_PROMPT = """You are a marketing copywriter for Thriftbyoba, 
a Nigerian online fashion store. Write punchy, warm push notification copy.

Rules:
- Title: max 50 characters
- Body: max 100 characters  
- Always use ₦ for prices, never $
- Tone: warm, exciting, Nigerian-friendly
- Never use generic phrases like "Check it out" or "Don't miss out"
- Be specific about what's on offer
"""

_COPY_PROMPT = """
Generate a push notification for Thriftbyoba customers.

Available products (pick the most exciting 1-2):
{products}

Return ONLY valid JSON with this exact shape:
{{
  "title": "...",
  "body": "...",
  "url": "/collections"
}}
"""


async def generate_notification_copy(products: list[dict]) -> dict:
    """Use LLM to generate push notification title and body."""
    try:
        llm = get_llm()

        product_lines = "\n".join(
            f"- {p['name']} at ₦{float(p['price']):,.0f}"
            for p in products[:5]
        )

        prompt = _COPY_PROMPT.format(products=product_lines)

        resp = await llm.ainvoke([
            SystemMessage(content=_MARKETING_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ])

        content = resp.content
        if isinstance(content, list):
            content = "\n".join(
                b.get("text", "") for b in content
                if isinstance(b, dict) and b.get("type") == "text"
            )

        # Strip markdown fences if present
        content = content.strip().removeprefix("```json").removesuffix("```").strip()
        parsed = json.loads(content)

        # Validate required fields
        assert "title" in parsed and "body" in parsed
        assert len(parsed["title"]) <= 50
        assert len(parsed["body"]) <= 100

        logger.debug(f"[Marketing] Generated copy: {parsed}")
        return parsed

    except Exception as e:
        logger.error(f"[Marketing] Copy generation failed: {e}")
        return {
            "title": "We Saved This Just for You 🎁",
            "body": "Fresh styles just dropped. Come see what's new.",
            "url": "/collections",
        }