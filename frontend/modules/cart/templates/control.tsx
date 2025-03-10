"use client";

import CartItemSelect from "@modules/cart/components/cart-item-select";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { Spinner } from "@components/spinner";

import CartDeleteButton from "@/modules/common/components/cart-delete-button";
import { CartItem } from "@/lib/models";
import { api } from "@/apis";

type ItemsTemplateProps = {
    item: CartItem;
};

const Control = ({ item }: ItemsTemplateProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [updating, setUpdating] = useState(false);

    const changeQuantity = async (id: string, quantity: number) => {
        setUpdating(true);

        const res = await api.cart.update({
            product_id: id,
            quantity,
        });

        if ("error" in res) {
            enqueueSnackbar(res.message, { variant: "error" });
        }
    };

    return (
        <div className="flex gap-2 items-center w-28">
            <CartDeleteButton data-testid="product-delete-button" id={item.item_id} />
            <CartItemSelect
                className="w-14 h-10 p-4"
                data-testid="product-select-button"
                value={item.quantity}
                onChange={(value) => changeQuantity(item.item_id, parseInt(value.target.value))}
            >
                {Array.from(
                    {
                        length: 10,
                    },
                    (_, i) => (
                        <option key={i} value={i + 1}>
                            {i + 1}
                        </option>
                    )
                )}
            </CartItemSelect>
            {updating && <Spinner key={item.product_id} />}
        </div>
    );
};

export default Control;
