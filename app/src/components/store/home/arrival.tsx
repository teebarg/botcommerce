import { PageLoader } from "@/components/generic/page-loader";
import ProductSection from "../product-section";
import type { ProductSearch } from "@/schemas";

export default function NewArrivals({ products, isLoading }: { products: ProductSearch[], isLoading?: boolean }) {
    if (isLoading) return <PageLoader variant="product-section" />;
    if (!products?.length) return null;
    return (
        <ProductSection
            title="New arrivals"
            subtitle="Just landed this week"
            products={products}
            href="/collections/new-arrivals"
        />
    );
}
