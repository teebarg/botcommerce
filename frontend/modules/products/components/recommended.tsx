import { api } from "@/apis";
import ProductCard from "@/components/store/products/product-card";
import { ProductSearch } from "@/lib/models";

type RecommendedProductsProps = {
    exclude?: Array<string | number>;
};

export default async function RecommendedProducts({ exclude = [] }: RecommendedProductsProps) {
    const { data, error } = await api.product.search({ limit: 40 });

    if (error || !data) {
        return null;
    }

    // const filteredProducts = exclude?.length ? data.products.filter((product: ProductSearch) => !exclude.includes(product.variants[0].id)) : data.products;
    const filteredProducts = data.products;

    return (
        <div>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-8">
                {filteredProducts.map((product: ProductSearch, idx: number) => (
                    <li key={idx}>
                        <ProductCard product={product} wishlist={[]} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
