import { authApi } from "./auth";
import { brandApi } from "./brand";
import { cartApi } from "./cart";
import { orderApi } from "./order";
import { categoryApi } from "./category";
import { collectionApi } from "./collection";
import { productApi } from "./product";
import { userApi } from "./user";

export const api = {
    auth: authApi,
    brand: brandApi,
    cart: cartApi,
    collection: collectionApi,
    category: categoryApi,
    order: orderApi,
    product: productApi,
    user: userApi,
};
