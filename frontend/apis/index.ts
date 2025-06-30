import { authApi } from "./auth";
import { productApi } from "./product";
import { userApi } from "./user";
import { reviewsApi } from "./review";
import { paymentApi } from "./payment";
import { adminApi } from "./admin";

export const api = {
    auth: authApi,
    payment: paymentApi,
    product: productApi,
    review: reviewsApi,
    user: userApi,
    admin: adminApi,
};
