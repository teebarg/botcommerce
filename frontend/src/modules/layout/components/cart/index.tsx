import { retrieveCart } from "@modules/cart/actions";
import React from "react";

import { CartComponent } from "./cart-component";

interface ComponentProps {}

const fetchCart = async () => {
    const cart = await retrieveCart();

    return cart;
};

const Cart: React.FC<ComponentProps> = async () => {
    const cart = await fetchCart();

    return <CartComponent cart={cart} />;
};

export { Cart };
