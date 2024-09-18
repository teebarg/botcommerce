import { MeiliSearch, Index, SearchParams, MeiliSearchApiError } from "meilisearch";

// Assume these are defined in your environment or configuration file
const MEILI_HOST = process.env.MEILI_HOST as string;
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY as string;

// Initialize Meilisearch client
const client = new MeiliSearch({
    host: MEILI_HOST,
    apiKey: MEILI_MASTER_KEY,
});

// Custom serializer function
const customSerializer = (key: string, value: any): any => {
    if (value instanceof Date || value instanceof RegExp) {
        return value.toString();
    }
    return value;
};

const getOrCreateIndex = async (indexName: string): Promise<Index> => {
    try {
        return await client.getIndex(indexName);
    } catch (error) {
        if (error instanceof MeiliSearchApiError && error.message.includes("index_not_found")) {
            await client.createIndex(indexName);
            return client.index(indexName);
        }
        throw error;
    }
};

const addDocumentsToIndex = async <T extends Record<string, any>>(indexName: string, documents: T[]): Promise<void> => {
    const index = await getOrCreateIndex(indexName);
    await index.addDocuments(documents, { primaryKey: "id" });
};

const searchDocuments = async <T>(indexName: string, query: string, options: SearchParams = {}): Promise<any> => {
    const index = await getOrCreateIndex(indexName);
    return await index.search(query, options);
};

const multiSearchDocuments = async <T>(
    queries: {
        indexUid: string;
        q: string;
        limit?: number;
        sort?: string[];
        filter?: string;
    }[]
): Promise<any> => {
    return client.multiSearch({
        queries: queries,
    });
};

const updateDocument = async <T extends Record<string, any>>(indexName: string, document: T): Promise<void> => {
    const index = await getOrCreateIndex(indexName);
    await index.updateDocuments([document]);
};

const deleteDocument = async (indexName: string, documentId: string | number): Promise<void> => {
    const index = await getOrCreateIndex(indexName);
    await index.deleteDocument(documentId);
};

const clearIndex = async (indexName: string): Promise<void> => {
    const index = await getOrCreateIndex(indexName);
    await index.deleteAllDocuments();
};

const deleteIndex = async (indexName: string): Promise<void> => {
    await client.deleteIndex(indexName);
};

export { getOrCreateIndex, addDocumentsToIndex, searchDocuments, multiSearchDocuments, updateDocument, deleteDocument, clearIndex, deleteIndex };