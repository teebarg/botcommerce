import { ChatProduct } from "@/schemas";
import { ProductCard } from "./ProductCard";

export const ProductRecommendation = ({ products }: { products: ChatProduct[] }) => {
    return (
        <div className="flex gap-3 overflow-x-auto pb-1">
            {products.map((product, i) => (
                <ProductCard product={product} key={i} />
            ))}
        </div>
    );
};
