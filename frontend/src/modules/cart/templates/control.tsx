"use client";

import CartItemSelect from "@modules/cart/components/cart-item-select";
import DeleteButton from "@modules/common/components/delete-button";
import { updateLineItem } from "@modules/cart/actions";
import Spinner from "@modules/common/icons/spinner";
import { useState } from "react";
import { useSnackbar } from "notistack";

type ItemsTemplateProps = {
    // items: Omit<LineItem, "beforeInsert">[];
    item: any;
};

const Control = ({ item }: ItemsTemplateProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [updating, setUpdating] = useState(false);

    const changeQuantity = async (id: string, quantity: number) => {
        setUpdating(true);

        const message = await updateLineItem({
            lineId: id,
            quantity,
        })
            .catch((err) => {
                return err.message;
            })
            .finally(() => {
                setUpdating(false);
            });

        if (message) {
            enqueueSnackbar(message, { variant: "error" });
        }
    };

    return (
        <div className="flex gap-2 items-center w-28">
            <DeleteButton data-testid="product-delete-button" id={item.id} />
            <CartItemSelect
                className="w-14 h-10 p-4"
                data-testid="product-select-button"
                value={item.quantity}
                onChange={(value) => changeQuantity(item.id, parseInt(value.target.value))}
            >
                {Array.from(
                    {
                        length: Math.min(item.variant.inventory_quantity > 0 ? item.variant.inventory_quantity : 10, 10),
                    },
                    (_, i) => (
                        <option key={i} value={i + 1}>
                            {i + 1}
                        </option>
                    )
                )}
            </CartItemSelect>
            {updating && <Spinner key={item.id} />}
        </div>
    );
};

export default Control;
