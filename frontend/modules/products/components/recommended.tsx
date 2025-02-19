import { productSearch } from "@lib/data";
import { Product, SearchParams } from "types/global";
import dynamic from "next/dynamic";
const ProductCard = dynamic(() => import("@/components/product/product-card"), { loading: () => <p>Loading...</p> });

type RecommendedProductsProps = {
    exclude?: Array<string | number>;
};

export default async function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    // edit this function to define your related products logic
    const queryParams: SearchParams = {
        limit: 40,
    };

    const { products } = await productSearch(queryParams);

    if (!products.length) {
        return null;
    }

    const filteredProducts = exclude?.length ? products.filter((product: Product) => !exclude.includes(product.id.toString())) : products;

    return (
        <div>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-8">
                {filteredProducts.map((product: Product) => (
                    <li key={product.id}>
                        <ProductCard product={product} wishlist={[]} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
