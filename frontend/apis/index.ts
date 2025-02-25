import { authApi } from "./auth";
import { brandApi } from "./brand";
import { cartApi } from "./cart";
import { orderApi } from "./order";
import { categoryApi } from "./category";
import { collectionApi } from "./collection";
import { productApi } from "./product";
import { userApi } from "./user";
import { reviewsApi } from "./review";
import { configApi } from "./config";

export const api = {
    auth: authApi,
    brand: brandApi,
    cart: cartApi,
    collection: collectionApi,
    config: configApi,
    category: categoryApi,
    order: orderApi,
    product: productApi,
    review: reviewsApi,
    user: userApi,
};
