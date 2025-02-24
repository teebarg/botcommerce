import React from "react";

import { CartComponent } from "./cart-component";

import { api } from "@/api";

interface ComponentProps {}

const Cart: React.FC<ComponentProps> = async () => {
    const cart = await api.cart.get();

    if ("error" in cart) {
        return;
    }

    return <CartComponent cart={cart} />;
};

export { Cart };
