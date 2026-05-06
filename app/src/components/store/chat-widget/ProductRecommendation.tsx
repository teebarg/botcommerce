import { ChatProduct } from "@/schemas";
import { ProductCard } from "./ProductCard";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export const ProductRecommendation = ({ products }: { products: ChatProduct[] }) => {
    return (
        <div>
            <div className="flex justify-between mb-2 mt-1">
                <h2 className="text-sm">Products</h2>
                <Link to="/collections" className="flex items-center text-sm text-accent font-medium">
                    See More
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
                {products.map((product, i) => (
                    <ProductCard product={product} key={i} />
                ))}
            </div>
        </div>
    );
};
