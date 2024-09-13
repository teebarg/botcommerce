from meilisearch import Client
from json import JSONEncoder
from datetime import datetime
from uuid import UUID
from typing import Any
from core.config import settings

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
    index.add_documents(documents, primary_key='id', serializer=CustomEncoder)

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
