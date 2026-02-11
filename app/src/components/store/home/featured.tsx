import ProductSection from "../product-section";
import { ProductSearch } from "@/schemas";

export default function Featured({products}: {products: ProductSearch[]}) {

    if (products?.length === 0) return null;
    return <ProductSection title="Featured" products={products} href="/collections/featured" showGradient />;
}
