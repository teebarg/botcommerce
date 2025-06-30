import { authApi } from "./auth";
import { orderApi } from "./order";
import { productApi } from "./product";
import { userApi } from "./user";
import { reviewsApi } from "./review";
import { paymentApi } from "./payment";
import { shopSettingsApi } from "./shop-settings";
import { bankSettingsApi } from "./bank-details";
import { adminApi } from "./admin";

export const api = {
    auth: authApi,
    bank: bankSettingsApi,
    order: orderApi,
    payment: paymentApi,
    product: productApi,
    review: reviewsApi,
    user: userApi,
    shopSettings: shopSettingsApi,
    admin: adminApi,
};
