"use server";

import { searchDocuments } from "@lib/util/meilisearch";

interface Hits {
    readonly objectID?: string;
    id?: string;
    [x: string | number | symbol]: unknown;
}

/**
 * Uses MeiliSearch or Algolia to search for a query
 * @param {string} query - search query
 */
export async function search(query: string) {
    const { hits } = (await searchDocuments("products", query)) as { hits: Hits[] };
    return hits;
}
