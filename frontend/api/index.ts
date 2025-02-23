import { authApi } from "./auth";
import { brandApi } from "./brand";
import { categoryApi } from "./category";
import { collectionApi } from "./collection";
import { exampleApi } from "./example";
import { productApi } from "./product";
import { userApi } from "./user";

export const api = {
    auth: authApi,
    brand: brandApi,
    collection: collectionApi,
    category: categoryApi,
    example: exampleApi,
    product: productApi,
    user: userApi,
};
