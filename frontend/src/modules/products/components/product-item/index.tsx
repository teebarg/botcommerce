import { retrievePricedProductById } from "@lib/data";

import { ProductCard } from "../product-card";

interface ComponentProps {
    product: any;
}

const ProductItem: React.FC<ComponentProps> = async ({ product }) => {
    const pricedProduct = await retrievePricedProductById({
        id: product?.id,
    }).then((product) => product);

    // if (!pricedProduct) {
    //     return null;
    // }

    return <ProductCard product={product} />;
};

export { ProductItem };
