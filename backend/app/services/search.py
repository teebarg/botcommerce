import asyncio
from datetime import datetime
from typing import Any, Optional
from meilisearch import Client
from meilisearch.errors import MeilisearchApiError
from anyio import to_thread
from app.core.config import settings
from app.core.logging import get_logger
from json import JSONEncoder
from uuid import UUID


client = Client(settings.MEILI_HOST, settings.MEILI_MASTER_KEY)

REQUIRED_FILTERABLES: list[str] = ["id", "category_slugs", "collection_slugs", "name", "max_variant_price", "min_variant_price", "active", "sizes", "colors", "ages", "widths", "lengths"]
REQUIRED_SORTABLES: list[str] = ["id", "random_score", "created_at", "max_variant_price", "min_variant_price"]

logger = get_logger(__name__)


class CustomEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, (UUID, datetime)):
            return str(o)
        return super().default(o)

def get_or_create_index(index_name: str) -> Optional[Any]:
    """
    Get or create a Meilisearch index safely. Returns None if Meilisearch is unreachable.
    """
    try:
        return client.get_index(index_name)
    except MeilisearchApiError as e:
        logger.warning(f"MeilisearchApiError while fetching index: {index_name}")
        error_code = getattr(e, "code", None)
        if error_code == "index_not_found":
            try:
                index = client.index(index_name)
                create_task = client.create_index(uid=index_name)
                index.wait_for_task(create_task.task_uid)

                filter_task = index.update_filterable_attributes(REQUIRED_FILTERABLES)
                index.wait_for_task(filter_task.task_uid)

                sort_task = index.update_sortable_attributes(REQUIRED_SORTABLES)
                index.wait_for_task(sort_task.task_uid)
                return index
            except Exception as inner_e:
                logger.error(f"Failed to create and configure index {index_name}: {inner_e}")
                return None
    except Exception as e:
        logger.warning(f"Meilisearch instance unreachable or returning invalid response for {index_name}: {e}")
        try:
            client.create_index(index_name)
            return client.index(index_name)
        except Exception:
            return None


class SearchService:
    def __init__(self):
        self._index = None
        self.index_name = settings.MEILI_PRODUCTS_INDEX

    @property
    def index(self):
        """
        Dynamically try to fetch the index if it wasn't successfully loaded initially.
        """
        if self._index is None:
            self._index = get_or_create_index(self.index_name)
        return self._index

    async def search_index(self, query: str, options: dict) -> dict:
        if not self.index:
            logger.warning("Search dropped: Meilisearch index is unavailable.")
            return {"hits": [], "nbHits": 0, "exhaustiveNbHits": False, "query": query, "limit": 0, "offset": 0, "processingTimeMs": 0}

        def _search():
            return self.index.search(query, options)
            
        try:
            return await to_thread.run_sync(_search)
        except Exception as e:
            logger.error(f"Error during search query: {e}")
            return {"hits": [], "nbHits": 0}

    async def ensure_index_ready(self):
        if not self.index:
            return
        def _configure():
            filter_task = self.index.update_filterable_attributes(REQUIRED_FILTERABLES)
            self.index.wait_for_task(filter_task.task_uid)

            sort_task = self.index.update_sortable_attributes(REQUIRED_SORTABLES)
            self.index.wait_for_task(sort_task.task_uid)

        try:
            await to_thread.run_sync(_configure)
        except Exception as e:
            logger.error(f"Failed to run ensure_index_ready: {e}")


    def get_document_by_id(self, doc_id: str):
        if not self.index:
            return None
        try:
            doc = self.index.get_document(doc_id)
            return dict(doc)
        except Exception as e:
            logger.error(f"Error fetching document by ID: {e}")
            return None

    def get_documents_by_filter(self, filter_str: str, limit: int) -> list:
        if not self.index:
            return []
        try:
            results = self.index.get_documents({"filter": filter_str, "limit": limit})
            return results.results
        except Exception as e:
            logger.error(f"Error fetching documents by filter: {e}")
            return []

    async def update_document(self, index_name: str, document: dict) -> None:
        if not self.index:
            logger.warning("Skipping document update: Meilisearch unavailable.")
            return
        def _update():
            task = self.index.update_documents([document], serializer=CustomEncoder)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        try:
            task = await to_thread.run_sync(_update)
            logger.debug(f"Updated document {document['id']} in index {index_name}, task: {task.task_uid}")
        except Exception as e:
            logger.error(f"Failed to update document: {e}")

    async def add_documents_to_index(self, index_name: str, documents: list) -> None:
        if not self.index:
            logger.warning("Skipping add documents: Meilisearch unavailable.")
            return
        def _add():
            task = self.index.add_documents(documents, primary_key="id", serializer=CustomEncoder)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        try:
            task = await to_thread.run_sync(_add)
            logger.debug(f"Added {len(documents)} documents to index {index_name}, task: {task.task_uid}")
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")

    async def delete_document(self, index_name: str, document_id: str) -> None:
        if not self.index:
            return
        def _delete():
            task = self.index.delete_document(document_id)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        try:
            task = await to_thread.run_sync(_delete)
            logger.debug(f"Deleted document {document_id} from index {index_name}, task: {task.task_uid}")
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")

    async def clear_index(self, index_name: str) -> None:
        if not self.index:
            return
        def _clear():
            task = self.index.delete_all_documents()
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        try:
            task = await to_thread.run_sync(_clear)
            logger.debug(f"Cleared index {index_name}, task: {task.task_uid}")
        except Exception as e:
            logger.error(f"Failed to clear index: {e}")

    def update_settings(self):
        if not self.index:
            return
        try:
            self.index.update_filterable_attributes(REQUIRED_FILTERABLES)
            self.index.update_sortable_attributes(REQUIRED_SORTABLES)
        except Exception as e:
            logger.error(f"Failed to update settings: {e}")

    async def check(self) -> bool:
        """
        Directly checks Meilisearch instance status.
        """
        def _check_health() -> bool:
            try:
                # Fallback to direct client call if index hasn't initialized
                target = self.index.http if self.index else client.http
                health = target.get("/health")
                return health.get("status") == "available"
            except Exception:
                return False

        try:
            return await asyncio.wait_for(
                to_thread.run_sync(_check_health),
                timeout=2.0
            )
        except Exception:
            return False

    def delete_index(self, index_name: str) -> None:
        try:
            client.delete_index(index_name)
            logger.debug(f"Deleted index {index_name}")
            if index_name == self.index_name:
                self._index = None
        except Exception as e:
            logger.error(f"Failed to delete index: {e}")