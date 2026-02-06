import { useProductSearch } from "@/hooks/useProduct";
import ProductSection from "../product-section";

export default function NewArrivals() {
    const { data } = useProductSearch({ collections: "new-arrivals", limit: 10 });
    
    if (!data || data?.products?.length === 0) return null;
    return <ProductSection title="New Arrivals" products={data?.products || []} href="/collections/new-arrivals" showGradient />;
}
