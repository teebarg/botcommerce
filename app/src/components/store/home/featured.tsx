import { PageLoader } from "@/components/generic/page-loader";
import ProductSection from "../product-section";
import { ProductSearch } from "@/schemas";

export default function Featured({ products, isLoading }: { products: ProductSearch[], isLoading?: boolean }) {
    if (isLoading) return <PageLoader variant="product-section" />;
    if (products?.length === 0) return null;
    return (
        <ProductSection
            title="New arrivals"
            subtitle="Our specials"
            products={products}
            href="/collections/new-arrivals"
        />
    );
}
