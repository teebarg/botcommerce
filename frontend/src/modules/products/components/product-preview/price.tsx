import clsx from "clsx";

import { PriceType } from "../product-actions";

export default async function PreviewPrice({ price }: { price: PriceType }) {
    return (
        <>
            {price.price_type === "sale" && (
                <p className="line-through text-default-400" data-testid="original-price">
                    {price.original_price}
                </p>
            )}
            <p
                className={clsx("text-inherit", {
                    "text-blue-500": price.price_type === "sale",
                })}
                data-testid="price"
            >
                {price.calculated_price}
            </p>
        </>
    );
}
