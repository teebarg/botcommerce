import ProductSection from "../product-section";
import { useSuspenseQuery } from "@tanstack/react-query";
import { indexProductsQuery } from "@/hooks/useProduct";

export default function NewArrivals() {
    const { data } = useSuspenseQuery(indexProductsQuery());
    if (!data?.arrival?.length) return null;
    return (
        <ProductSection
            title="New arrivals"
            subtitle="Just landed this week"
            products={data?.arrival}
            href="/collections/new-arrivals"
        />
    );
}
