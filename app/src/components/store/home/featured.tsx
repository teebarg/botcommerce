import { useProductSearch } from "@/hooks/useProduct";
import ProductSection from "../product-section";

export default function Featured() {
    const { data, isLoading } = useProductSearch({ collections: "featured", limit: 10 });

    if (!data || data?.products?.length === 0 || isLoading) return null;
    return <ProductSection title="Featured" products={data?.products || []} href="/collections/featured" showGradient />;
}
