from fastapi import HTTPException
from prisma import Prisma

class ConversationService:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_conversation(self, uuid: str):
        conversation = await self.db.conversation.find_unique(
            where={"conversation_uuid": uuid}
        )

        if not conversation:
            raise HTTPException(status_code=404, detail="conversation not found")

        return conversation
