import ProductSection from "../product-section";
import { useSuspenseQuery } from "@tanstack/react-query";
import { indexProductsQuery } from "@/hooks/useProduct";

export default function Featured() {
    const { data } = useSuspenseQuery(indexProductsQuery());
    if (!data?.featured?.length) return null;
    return (
        <ProductSection
            title="Featured"
            subtitle="Our featured collection"
            products={data?.featured}
            href="/collections/featured"
        />
    );
}
