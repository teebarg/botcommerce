from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from .service import run_agent, run_agent_stream

router = APIRouter(prefix="/agent", tags=["agent"])

class ChatRequest(BaseModel):
    session_id: str
    user_id: int
    message: str

# Normal full response
@router.post("/chat")
async def chat(req: ChatRequest):
    response = run_agent(req.session_id, req.user_id, req.message)
    return {"response": response}

# Streaming endpoint for typing effect
@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    async def event_generator():
        for chunk in run_agent_stream(req.session_id, req.user_id, req.message):
            yield f"data: {chunk}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")