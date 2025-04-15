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
import { addressApi } from "./address";
import { paymentApi } from "./payment";
import { shopSettingsApi } from "./shop-settings";
import { bankSettingsApi } from "./bank-details";

export const api = {
    address: addressApi,
    auth: authApi,
    bank: bankSettingsApi,
    brand: brandApi,
    cart: cartApi,
    collection: collectionApi,
    config: configApi,
    category: categoryApi,
    order: orderApi,
    payment: paymentApi,
    product: productApi,
    review: reviewsApi,
    user: userApi,
    shopSettings: shopSettingsApi,
};
