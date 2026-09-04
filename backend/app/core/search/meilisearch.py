from typing import Any

import meilisearch

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

REQUIRED_FILTERABLES: list[str] = [
    "id",
    "category_slugs",
    "collection_slugs",
    "name",
    "max_variant_price",
    "min_variant_price",
    "active",
    "sizes",
    "colors",
    "ages",
    "widths",
    "lengths",
]
REQUIRED_SORTABLES: list[str] = [
    "id",
    "random_score",
    "created_at",
    "max_variant_price",
    "min_variant_price",
]
PRODUCT_ATTRIBUTES: list[str] = [
    "id",
    "name",
    "sku",
    "slug",
    "active",
    "is_new",
    "status",
    "image",
    "images",
    "variants",
    "min_variant_price",
    "max_variant_price",
]


class MeilisearchEngine:
    def __init__(self):
        self.index_name = settings.MEILI_PRODUCTS_INDEX
        self.client = meilisearch.Client(settings.MEILI_HOST, settings.MEILI_MASTER_KEY)

    async def configure_index(self):
        meili_index = self.client.index(self.index_name)

        meili_index.update_searchable_attributes(
            [
                "name",
                "status",
                "categories.name",
                "collections.name",
                "description",
            ]
        )

        meili_index.update_filterable_attributes(REQUIRED_FILTERABLES)
        meili_index.update_sortable_attributes(REQUIRED_SORTABLES)
        meili_index.update_displayed_attributes(PRODUCT_ATTRIBUTES)

    async def get_document(
        self,
        document_id: int | str,
    ) -> dict:
        document = self.client.index(self.index_name).get_document(str(document_id))
        return dict(document)

    async def search(
        self,
        query: str,
        *,
        filters: str | None = None,
        facets: list[str] | None = None,
        sort: list[str] | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> dict[str, Any]:

        search_params = {
            "page": page,
            "hitsPerPage": limit,
        }

        if filters:
            search_params["filter"] = filters

        if facets:
            search_params["facets"] = facets

        if sort:
            search_params["sort"] = sort

        result = self.client.index(self.index_name).search(
            query,
            search_params,
        )

        return result

    async def index(self, documents: list[dict[str, Any]]) -> None:

        self.client.index(self.index_name).add_documents(
            documents,
            primary_key="id",
        )

    async def delete(
        self,
        document_ids: list[str | int],
    ) -> None:

        self.client.index(self.index_name).delete_documents(
            document_ids,
        )

    async def clear(
        self,
    ) -> None:

        self.client.index(self.index_name).delete_all_documents()
