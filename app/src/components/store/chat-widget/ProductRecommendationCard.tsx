import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "./types";

export const ProductRecommendationCard = ({ products }: { products: Product[] }) => {
    return (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {products.map((product, i) => (
                <motion.div
                    key={product.sku}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl overflow-hidden min-w-[160px] max-w-[160px] shrink-0"
                >
                    <div className="relative h-28 overflow-hidden">
                        <img src={product.image_url || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-xs font-semibold text-foreground">{product.price}</span>
                    </div>
                    <div className="p-3 space-y-2">
                        <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                        <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg gradient-primary text-xs font-medium text-primary-foreground">
                            <ShoppingBag className="w-3 h-3" />
                            Add
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
