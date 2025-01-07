from datetime import datetime
from json import JSONEncoder
from typing import Any
from uuid import UUID

from meilisearch import Client

from app.core.config import settings

# Initialize Meilisearch client
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
        print(f"Error fetching document by ID: {e}")

def get_document_by_attribute(index_name: str, attribute: str, value: Any) -> dict:
    """
    Get a document from a Meilisearch index by a specific attribute.

    Args:
        index_name: Name of the Meilisearch index
        attribute: The attribute/field to search on
        value: The value to match against the attribute

    Returns:
        dict: The matching document or None if not found
    """
    try:
        index = get_or_create_index(index_name)
        # Create filter string in Meilisearch format
        filter_str = f"{attribute} = '{value}'"
        # Search with the filter, limit 1 since we want a single doc
        result = index.search("", {
            "filter": filter_str,
            "limit": 1
        })
        # Return first hit if found, otherwise None
        return result["hits"][0] if result["hits"] else None
    except Exception as e:
        print(f"Error fetching document by attribute: {e}")
        return None


def search_documents(index_name: str, query: str, **kwargs) -> dict:
    """
    Search documents in a Meilisearch index.
    """
    index = get_or_create_index(index_name)
    return index.search(query, kwargs)


def update_document(index_name: str, document: dict) -> None:
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
