import type React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useProductVariant } from "@/hooks/useProductVariant";
import type { Product } from "@/schemas/product";
import { motion } from "framer-motion";
import { useUserCreateWishlist, useUserDeleteWishlist } from "@/hooks/useUser";
import ProductShare from "./product-share";

interface VariantSelectionProps {
    product: Product;
    inWishlist: boolean;
}

export const ProductVariantActions: React.FC<VariantSelectionProps> = ({ product, inWishlist }) => {
    const { isAdded, handleAddToCart, outOfStock } = useProductVariant(product);

    const { mutate: createWishlist } = useUserCreateWishlist();
    const { mutate: deleteWishlist } = useUserDeleteWishlist();

    const addWishlist = async () => {
        createWishlist(product.id);
    };

    const removeWishlist = async () => {
        deleteWishlist(product.id);
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex gap-3">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        inWishlist ? removeWishlist() : addWishlist();
                    }}
                    className={`p-3 rounded-xl border transition-colors ${
                        inWishlist ? "bg-primary/10 border-primary" : "bg-background border-border hover:border-primary"
                    }`}
                >
                    <Heart className={`w-6 h-6 ${inWishlist ? "fill-primary text-primary" : "text-foreground"}`} />
                </motion.button>

                <ProductShare name={product.name} />

                <motion.button
                    whileHover={!outOfStock ? { scale: 1.02 } : {}}
                    whileTap={!outOfStock ? { scale: 0.98 } : {}}
                    onClick={!outOfStock ? handleAddToCart : undefined}
                    disabled={outOfStock}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        outOfStock
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : isAdded
                            ? "bg-green-500 text-white"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                >
                    {outOfStock ? (
                        "Out of Stock"
                    ) : isAdded ? (
                        <>
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                ✓
                            </motion.span>
                            Added to Cart!
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* {selectedVariant?.status === "OUT_OF_STOCK" ? (
                <Button className="mt-4 w-max px-16 py-6" disabled={true}>
                    Out of Stock
                </Button>
            ) : (
                <Button
                        className="gap-2 bg-[#075e54] hover:bg-[#128c7e] text-white w-auto"
                        disabled={loading || !selectedVariant || outOfStock}
                        size="lg"
                        onClick={handleWhatsAppPurchase}
                    >
                        <MessageCircleMore className="w-4 h-4" />
                        <span>Buy on WhatsApp</span>
                    </Button>
            )} */}
        </>
    );
};
