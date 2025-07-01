import { authApi } from "./auth";
import { productApi } from "./product";
import { userApi } from "./user";
import { reviewsApi } from "./review";
import { adminApi } from "./admin";

export const api = {
    auth: authApi,
    product: productApi,
    review: reviewsApi,
    user: userApi,
    admin: adminApi,
};
