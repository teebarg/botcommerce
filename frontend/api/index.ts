import { authApi } from "./auth";
import { brandApi } from "./brand";
import { cartApi } from "./cart";
import { orderApi } from "./order";
import { categoryApi } from "./category";
import { collectionApi } from "./collection";
import { exampleApi } from "./example";
import { productApi } from "./product";
import { userApi } from "./user";

export const api = {
    auth: authApi,
    brand: brandApi,
    cart: cartApi,
    collection: collectionApi,
    category: categoryApi,
    example: exampleApi,
    order: orderApi,
    product: productApi,
    user: userApi,
};
