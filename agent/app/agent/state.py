from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional


class AgentState(BaseModel):
    """State passed through the entire graph (one turn)."""
    customer_id: Optional[str] = None
    message: str = ""                    # clean user message (no [Customer ID:] prefix)
    intent: Optional[str] = None
    params: Dict[str, Any] = Field(default_factory=dict)
    reply: str = ""
    sources: List[str] = Field(default_factory=list)
    escalated: bool = False