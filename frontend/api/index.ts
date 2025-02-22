import { authApi } from "./auth";
import { categoryApi } from "./category";
import { collectionApi } from "./collection";
import { exampleApi } from "./example";
import { productApi } from "./product";
import { userApi } from "./user";

export const api = {
    auth: authApi,
    collection: collectionApi,
    category: categoryApi,
    example: exampleApi,
    product: productApi,
    user: userApi,
};
