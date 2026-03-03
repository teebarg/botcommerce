from app.prisma_client import prisma as db

async def get_conversation(uuid: str):
    conversation = await db.conversation.find_unique(
        where={"conversation_uuid": uuid}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="conversation not found")
    return conversation
