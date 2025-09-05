from datetime import datetime
from json import JSONEncoder
from typing import Any
from uuid import UUID

from meilisearch import Client

from app.core.config import settings
from app.core.logging import logger
from meilisearch.errors import MeilisearchApiError

client = Client(settings.MEILI_HOST, settings.MEILI_MASTER_KEY)

REQUIRED_FILTERABLES = ["id", "brand", "category_slugs", "collection_slugs", "name", "variants", "average_rating",
                "review_count", "max_variant_price", "min_variant_price", "active"]
REQUIRED_SORTABLES = ["created_at", "max_variant_price", "min_variant_price", "average_rating", "review_count", "active"]


class CustomEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, (UUID, datetime)):
            return str(o)
        return super().default(o)


def ensure_index_ready(index):
    """
    Ensures that the given Meilisearch index has the required
    filterable and sortable attributes.
    """
    filter_task = index.update_filterable_attributes(REQUIRED_FILTERABLES)
    index.wait_for_task(filter_task.task_uid)

    sort_task = index.update_sortable_attributes(REQUIRED_SORTABLES)
    index.wait_for_task(sort_task.task_uid)


def get_or_create_index(index_name: str) -> Any:
    """
    Get or create a Meilisearch index.
    """
    try:
        return client.get_index(index_name)
    except MeilisearchApiError as e:
        error_code = getattr(e, "code", None)
        if error_code == "index_not_found":
            index = client.index(index_name)
            logger.error(f"Index {index_name} not found")
            create_task = client.create_index(uid=index_name)
            index.wait_for_task(create_task.task_uid)

            ensure_index_ready(index)
            return index
    except Exception:
        logger.error(f"Error creating index {index_name}")
        client.create_index(index_name)
        return client.index(index_name)


def add_documents_to_index(index_name: str, documents: list) -> None:
    """
    Add documents to a Meilisearch index.
    """
    index = get_or_create_index(index_name)
    index.add_documents(documents, primary_key="id", serializer=CustomEncoder)


def get_document_by_id(index_name: str, doc_id: str):
    """
    Search documents in a Meilisearch index.
    """
    try:
        index = get_or_create_index(index_name)
        doc = index.get_document(doc_id)
        return dict(doc)
    except Exception as e:
        logger.error(f"Error fetching document by ID: {e}")


async def update_document(index_name: str, document: dict) -> None:
    """
    Update a document in a Meilisearch index.
    """
    index = get_or_create_index(index_name)
    index.update_documents([document], serializer=CustomEncoder)


def delete_document(index_name: str, document_id: str) -> None:
    """
    Delete a document from a Meilisearch index.
    """
    index = get_or_create_index(index_name)
    index.delete_document(document_id)


def clear_index(index_name: str) -> None:
    """
    Clear index from a Meilisearch.
    """
    index = get_or_create_index(index_name)
    index.delete_all_documents()


def delete_index(index_name: str) -> None:
    """
    Clear index from a Meilisearch.
    """
    client.delete_index(index_name)
