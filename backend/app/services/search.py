import asyncio
from datetime import datetime
from typing import Any

from app.core.config import settings
from app.core.logging import get_logger
from json import JSONEncoder
from uuid import UUID

from meilisearch import Client
from meilisearch.errors import MeilisearchApiError
from anyio import to_thread


client = Client(settings.MEILI_HOST, settings.MEILI_MASTER_KEY)

REQUIRED_FILTERABLES: list[str] = ["id", "category_slugs", "collection_slugs", "name", "max_variant_price", "min_variant_price", "active", "sizes", "colors", "ages", "widths", "lengths"]
REQUIRED_SORTABLES: list[str] = ["id", "created_at", "max_variant_price", "min_variant_price"]

logger = get_logger(__name__)


class CustomEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, (UUID, datetime)):
            return str(o)
        return super().default(o)

def get_or_create_index(index_name: str) -> Any:
    """
    Get or create a Meilisearch index.
    """
    try:
        return client.get_index(index_name)
    except MeilisearchApiError as e:
        logger.error(f"MeilisearchApiError: {index_name}")
        error_code = getattr(e, "code", None)
        if error_code == "index_not_found":
            index = client.index(index_name)
            logger.error(f"Index {index_name} not found")
            create_task = client.create_index(uid=index_name)
            index.wait_for_task(create_task.task_uid)

            filter_task = index.update_filterable_attributes(REQUIRED_FILTERABLES)
            index.wait_for_task(filter_task.task_uid)

            sort_task = index.update_sortable_attributes(REQUIRED_SORTABLES)
            index.wait_for_task(sort_task.task_uid)
            return index
    except Exception as e:
        logger.error(f"Error creating index {index_name}: {e}")
        client.create_index(index_name)
        return client.index(index_name)


class SearchService:
    def __init__(self):
        self.index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)

    def ensure_index_ready(self):
        """
        Ensures that the given Meilisearch index has the required
        filterable and sortable attributes.
        """
        filter_task = self.index.update_filterable_attributes(REQUIRED_FILTERABLES)
        self.index.wait_for_task(filter_task.task_uid)

        sort_task = self.index.update_sortable_attributes(REQUIRED_SORTABLES)
        self.index.wait_for_task(sort_task.task_uid)

    def search_index(self, query: str, options: dict) -> dict:
        return self.index.search(query, options)

    def get_document_by_id(self, doc_id: str):
        """
        Search documents in a Meilisearch index.
        """
        try:
            doc = self.index.get_document(doc_id)
            return dict(doc)
        except Exception as e:
            logger.error(f"Error fetching document by ID: {e}")

    def get_documents_by_filter(self, filter_str: str, limit: int) -> list:
        results = self.index.get_documents({"filter": filter_str, "limit": limit})
        return results.results

    async def update_document(self, index_name: str, document: dict) -> None:
        """
        Update a document in a Meilisearch index and wait for completion.
        """
        def _update():
            task = self.index.update_documents([document], serializer=CustomEncoder)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_update)
        logger.debug(f"Updated document {document['id']} in index {index_name}, task: {task.task_uid}")

    async def add_documents_to_index(self, index_name: str, documents: list) -> None:
        """
        Add documents to a Meilisearch index and wait for completion.
        """
        def _add():
            task = self.index.add_documents(documents, primary_key="id", serializer=CustomEncoder)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_add)
        logger.debug(f"Added {len(documents)} documents to index {index_name}, task: {task.task_uid}")

    async def delete_document(self, index_name: str, document_id: str) -> None:
        """
        Delete a document from a Meilisearch index and wait for completion.
        """
        def _delete():
            task = self.index.delete_document(document_id)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_delete)
        logger.debug(f"Deleted document {document_id} from index {index_name}, task: {task.task_uid}")

    async def clear_index(self, index_name: str) -> None:
        """
        Clear all documents from a Meilisearch index and wait for completion.
        """
        def _clear():
            task = self.index.delete_all_documents()
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_clear)
        logger.debug(f"Cleared index {index_name}, task: {task.task_uid}")

    def update_settings(self):
        self.index.update_filterable_attributes(REQUIRED_FILTERABLES)
        self.index.update_sortable_attributes(REQUIRED_SORTABLES)

    async def check(self) -> bool:
        """
        Directly checks Meilisearch instance status using the index's internal
        HTTP client to hit the /health endpoint.
        """
        def _check_health() -> bool:
            try:
                # self.index.http is the underlying sync connection manager
                # It safely handles the authorization headers and base URL
                health = self.index.http.get("/health")
                return health.get("status") == "available"
            except Exception as e:
                logger.error(f"Meilisearch internal health request failed: {e}")
                return False

        try:
            # Wrap in asyncio.wait_for to prevent a hanging network socket from locking the loop
            return await asyncio.wait_for(
                to_thread.run_sync(_check_health),
                timeout=2.0
            )
        except Exception as e:
            logger.error(f"[Health Check] Meilisearch connection timed out or failed: {e}")
            return False

    def delete_index(self, index_name: str) -> None:
        """
        Clear index from a Meilisearch.
        """
        client.delete_index(index_name)
        logger.debug(f"Deleted index {index_name}")
