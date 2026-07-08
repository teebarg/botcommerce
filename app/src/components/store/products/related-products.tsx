import type { ProductSearch } from "@/schemas/product";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { PageLoader } from "@/components/generic/page-loader";
import ProductCard from "@/components/store/products/product-card-revamped";

type RelatedProductsProps = {
    productId: number;
};

export default function RelatedProducts({ productId }: RelatedProductsProps) {
    const { data, isPending, error } = useQuery({
        queryKey: ["products", "similar", productId],
        queryFn: async () => await api.get<{ similar: ProductSearch[] }>(`/product/${productId}/similar`, { params: { limit: 4 } }),
    });
    
    if (isPending) {
        return <PageLoader variant="grid" />
    }

    const productPreviews = data?.similar?.filter((item: ProductSearch) => item.id !== productId);
    if (error || !productPreviews?.length) {
        return null;
    }

    return (
        <div className="max-w-sxl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <span className="text-sm text-muted-foreground">Related products</span>
                <p className="text-base text-foreground max-w-lg">You might also want to check out these products.</p>
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {productPreviews?.map((product: ProductSearch, idx: number) => (
                    <li key={idx}>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
