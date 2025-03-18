import React from "react";

import { CartComponent } from "./cart-component";

import { api } from "@/apis";

interface ComponentProps {}

const Cart: React.FC<ComponentProps> = async () => {
    const { data, error } = await api.cart.get();
    console.log(data);
    console.log(error);
    //
    if (error || !data) {
        return;
    }

    return <CartComponent cart={data} />;
};

export { Cart };
