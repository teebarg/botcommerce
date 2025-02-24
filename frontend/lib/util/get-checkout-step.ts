import { Cart } from "../models";

export function getCheckoutStep(cart: Omit<Cart, "beforeInsert" | "beforeUpdate" | "afterUpdateOrLoad">) {
    if (!cart?.shipping_address?.address_1 || !cart.email) {
        return "address";
    } else if (cart?.shipping_method) {
        return "delivery";
    } else {
        return "payment";
    }
}
