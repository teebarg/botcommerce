import { enrichLineItems, retrieveCart } from "@modules/cart/actions";
import React from "react";

import { CartComponent } from "./cart-component";

interface ComponentProps {}

const fetchCart = async () => {
    const cart = await retrieveCart();

    if (cart?.items.length) {
        const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id);

        cart.items = enrichedItems as LineItem[];
    }

    return cart;
};

const Cart: React.FC<ComponentProps> = async () => {
    const cart = await fetchCart();

    return <CartComponent cart={cart} />;
};

export { Cart };
