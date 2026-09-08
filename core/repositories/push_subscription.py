from core.db.models import PushSubscription
from core.repositories.base_repository import BaseRepository


class PushSubscriptionRepository(BaseRepository[PushSubscription]):
    model = PushSubscription