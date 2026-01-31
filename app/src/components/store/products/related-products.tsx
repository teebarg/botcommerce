import type { ProductSearch } from "@/schemas/product";
import ProductCard from "@/components/store/products/product-card";

type RelatedProductsProps = {
    similar: ProductSearch[];
    productId: number;
};

export default function RelatedProducts({ similar, productId }: RelatedProductsProps) {
    const productPreviews = similar?.filter((item: ProductSearch) => item.id !== productId);

    if (!productPreviews?.length) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col items-center text-center mb-12">
                <span className="text-base text-muted-foreground">Related products</span>
                <p className="text-lg md:text-xl text-foreground max-w-lg">You might also want to check out these products.</p>
            </div>

            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-8">
                {productPreviews?.slice(0, 4)?.map((product: ProductSearch, idx: number) => (
                    <li key={idx}>
                        <ProductCard product={product} index={idx} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
