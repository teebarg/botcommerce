import { del, get, set } from "idb-keyval";

const DRAFT_KEY = "product-image-draft";

export const saveProductImageDraft = async (images: any[]) => {
    await set(DRAFT_KEY, images);
};

export const getProductImageDraft = async () => {
    return (await get(DRAFT_KEY)) || [];
};

export const clearProductImageDraft = async () => {
    await del(DRAFT_KEY);
};
