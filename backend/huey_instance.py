from huey import RedisHuey
from app.core.config import settings

huey = RedisHuey("botcommerce", url=settings.REDIS_URL)

import tasks.product_tasks
import tasks.sync_tasks
# Add imports for all your task files
