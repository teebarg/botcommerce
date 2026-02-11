import ProductSection from "../product-section";
import { ProductSearch } from "@/schemas";

export default function NewArrivals({products}: {products: ProductSearch[]}) {
    
    if (!products || products?.length === 0) return null;
    return <ProductSection title="New Arrivals" products={products} href="/collections/new-arrivals" showGradient />;
}
