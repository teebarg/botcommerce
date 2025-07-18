from datetime import datetime
from json import JSONEncoder
from typing import Any
from uuid import UUID

from meilisearch import Client

from app.core.config import settings
from app.core.logging import logger

client = Client(settings.MEILI_HOST, settings.MEILI_MASTER_KEY)


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
    except Exception:
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
