from core.repositories.base_repository import BaseRepository
from core.db.models import OrderTimeline

class OrderTimelineRepository(BaseRepository[OrderTimeline]):
    model = OrderTimeline