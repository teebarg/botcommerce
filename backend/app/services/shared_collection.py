from app.prisma_client import prisma as db
from typing import Optional
from app.core.logging import logger


class SharedCollectionService:
    @staticmethod
    async def track_visit(
        shared_collection_id: int,
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """
        Track a unique visit to a shared collection.
        """
        async with db.tx() as tx:
            try:
                if user_id:
                    existing_view = await db.sharedcollectionview.find_first(
                        where={
                            "shared_collection_id": shared_collection_id,
                            "user_id": user_id
                        }
                    )
                else:
                    existing_view = await db.sharedcollectionview.find_first(
                        where={
                            "shared_collection_id": shared_collection_id,
                            "user_id": None,
                            "ip_address": ip_address,
                            "user_agent": user_agent
                        }
                    )
                
                if existing_view:
                    return False
                
                data = {
                    "shared_collection": {"connect": {"id": shared_collection_id}},
                    "ip_address": ip_address,
                    "user_agent": user_agent
                }
                if user_id:
                    data["user"] = {"connect": {"id": user_id}}
                
                await tx.sharedcollectionview.create(data=data)
                
                await tx.sharedcollection.update(
                    where={"id": shared_collection_id},
                    data={"view_count": {"increment": 1}}
                )
                
                return True
                
            except Exception as e:
                logger.error(f"Error tracking visit: {e}")
                return False
    
    @staticmethod
    async def get_visit_count(shared_collection_id: int) -> int:
        """
        Get the total number of unique visits for a shared collection.
        """
        try:
            count = await db.sharedcollectionview.count(
                where={"shared_collection_id": shared_collection_id}
            )
            return count
        except Exception as e:
            logger.error(f"Error getting visit count: {e}")
            return 0
