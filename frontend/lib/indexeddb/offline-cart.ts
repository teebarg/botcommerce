import { update, get, del } from "idb-keyval";

const CART_KEY = "offline-cart";

export const addToOfflineCart = async (item: { variant_id: number; quantity: number }) => {
    return update(CART_KEY, (items = []) => [...items, item]);
};

export const getOfflineCart = async () => {
    return (await get(CART_KEY)) || [];
};

export const clearOfflineCart = async () => {
    return del(CART_KEY);
};
