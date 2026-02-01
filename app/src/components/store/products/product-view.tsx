import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { currency } from "@/utils";
import type { ProductVariant } from "@/schemas";
import { ProductVariantSelection } from "@/components/products/product-variant-selection";
import type { Product } from "@/schemas/product";
import { type UserInteractionType, useTrackUserInteraction } from "@/hooks/useUserInteraction";
import { Button } from "@/components/ui/button";
import { useUpdateVariant } from "@/hooks/useProduct";
import { useRouteContext } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useUserWishlist } from "@/hooks/useUser";
import { useProductVariant } from "@/hooks/useProductVariant";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductVariantActions } from "@/components/products/product-variant-actions";

interface Props {
    product: Product;
}

// Mobile slide-up transition (TikTok/Instagram style)
// const mobileVariants = {
//     initial: { y: "100%" as const, opacity: 0 },
//     animate: {
//         y: 0,
//         opacity: 1,
//         transition: { type: "spring" as const, damping: 25, stiffness: 300 },
//     },
//     exit: {
//         y: "100%" as const,
//         opacity: 0,
//         transition: { type: "spring" as const, damping: 30, stiffness: 300 },
//     },
// };

// // Desktop fade-scale transition
// const desktopVariants = {
//     initial: { opacity: 0, scale: 0.95 },
//     animate: {
//         opacity: 1,
//         scale: 1,
//         transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
//     },
//     exit: {
//         opacity: 0,
//         scale: 0.95,
//         transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
//     },
// };

const ProductView: React.FC<Props> = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { outOfStock } = useProductVariant(product);
    const isMobile = useIsMobile();
    const isNew = useMemo(() => !!product?.is_new, [product]);
    // const [selectedImageId, setSelectedImageId] = useState<number>(product.images?.[0]?.id || 0);

    // const selectedImage = product.images?.find((img: ProductImage) => img.id === selectedImageId) || product.images?.[0];

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);

    const { session } = useRouteContext({ strict: false });
    const trackInteraction = useTrackUserInteraction();
    const updateVariant = useUpdateVariant(false);

    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    const handleMarkVariantOutOfStock = async (variant: ProductVariant) => {
        if (!variant?.id) return;
        const previousInventory = typeof variant.inventory === "number" ? variant.inventory : 0;

        updateVariant.mutateAsync({ id: variant.id, inventory: 0 }).then(() => {
            toast.success(`Variant ${variant.sku} marked out of stock`, {
                action: {
                    label: "Undo",
                    onClick: async () => {
                        await updateVariant.mutateAsync({ id: variant.id, inventory: previousInventory });
                    },
                },
                duration: 10000,
                onAutoClose: () => {
                    window.location.reload();
                },
                onDismiss: () => {
                    window.location.reload();
                },
            });
        });
    };

    useEffect(() => {
        const startTime = Date.now();

        return () => {
            const timeSpent = Date.now() - startTime;

            handleUserInteraction("VIEW", { timeSpent: timeSpent.toString() });
        };
    }, [session?.id, product?.id]);

    const handleUserInteraction = async (type: UserInteractionType, metadata?: Record<string, any>) => {
        if (session?.user && product?.id) {
            trackInteraction.mutate({
                user_id: session.id,
                product_id: product.id,
                type,
                metadata: { source: "product-view", ...metadata },
            });
        }
    };

    const pageVariants = isMobile
        ? {
              initial: { y: "100%", opacity: 0 },
              animate: { y: 0, opacity: 1 },
              exit: { y: "100%", opacity: 0 },
          }
        : {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.95 },
          };

    const pageTransition = isMobile
        ? {
              type: "spring" as const,
              damping: 30,
              stiffness: 300,
          }
        : {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] as const,
          };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen bg-background relative"
        >
            {/* Main content */}
            {/* <div className="md:max-w-6xl md:mx-auto md:py-8 md:px-4"> */}
            <div className="md:max-w-6xl md:mx-auto md:py-8 md:px-4 md:grid md:grid-cols-2 md:gap-8 md:items-start">
                <motion.div
                    initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative aspect-square md:aspect-[4/5] md:rounded-3xl md:overflow-hidden md:sticky md:top-16"
                >
                    <img
                        key={currentImageIndex}
                        src={product.images[currentImageIndex].image}
                        alt={product.name}
                        className={`w-full h-full object-cover ${outOfStock ? "opacity-60 grayscale" : ""}`}
                    />

                    <div className="absolute top-4 left-4 flex flex-col gap-2 md:top-6 md:left-6">
                        {isNew && (
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full"
                            >
                                NEW
                            </motion.span>
                        )}
                    </div>
                    <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                        {product.images?.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-primary w-6" : "bg-white/50"}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Discount Badge */}
                    {/* {discount > 0 && (
                            <div className="absolute top-4 right-4 text-sm font-semibold text-primary-foreground bg-primary px-3 py-1 rounded-full">
                                -{discount}% OFF
                            </div>
                        )} */}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="py-6 space-y-5 md:py-0"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-sm font-bold text-white">R</span>
                        </div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl font-bold text-foreground"
                    >
                        {product.name}
                    </motion.h1>

                    {/* Price */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-baseline gap-3">
                        <span className="text-3xl md:text-4xl font-bold text-foreground">{currency(selectedVariant?.price)}</span>
                        {selectedVariant?.old_price > selectedVariant?.price && (
                            <span className="text-lg text-muted-foreground line-through">{currency(selectedVariant?.old_price)}</span>
                        )}
                    </motion.div>

                    {session?.user?.isAdmin && product?.variants?.length ? (
                        <div className="flex flex-col gap-2 mt-4">
                            {product.variants?.map((v) => (
                                <div key={v.id} className="flex lg:flex-row items-center justify-between text-sm gap-2 bg-secondary p-2">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <span>SKU: {v.sku}</span>
                                        <span>Inventory: {v.inventory}</span>
                                        <span className={v.inventory > 0 ? "text-emerald-600" : "text-red-600"}>
                                            {v.inventory > 0 ? "IN_STOCK" : "OUT_OF_STOCK"}
                                        </span>
                                    </div>
                                    {v.inventory > 0 && (
                                        <Button size="sm" variant="warning" onClick={() => handleMarkVariantOutOfStock(v)}>
                                            Mark out of stock
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <ProductVariantSelection product={product} onVariantChange={setSelectedVariant} />

                    <div className="mt-4">
                        <p className="line-clamp-3 text-base text-muted-foreground">{product.description}</p>
                    </div>
                    {session?.user?.isAdmin && product?.variants?.length ? (
                        <div className="flex flex-col gap-2 mt-4">
                            {product.variants?.map((v) => (
                                <div key={v.id} className="flex lg:flex-row items-center justify-between text-sm gap-2 bg-secondary p-2">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <span>SKU: {v.sku}</span>
                                        <span>Inventory: {v.inventory}</span>
                                        <span className={v.inventory > 0 ? "text-emerald-600" : "text-red-600"}>
                                            {v.inventory > 0 ? "IN_STOCK" : "OUT_OF_STOCK"}
                                        </span>
                                    </div>
                                    {v.inventory > 0 && (
                                        <Button size="sm" variant="warning" onClick={() => handleMarkVariantOutOfStock(v)}>
                                            Mark out of stock
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* Action buttons */}
                    <ProductVariantActions product={product} inWishlist={inWishlist} />

                    {/* Description */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-4 border-t border-border">
                        <p className="text-sm font-medium text-foreground mb-2">Description</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Premium quality product with exceptional craftsmanship. Perfect for everyday use with durable materials and modern design.
                            Experience comfort and style combined.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="pt-4 border-t border-border space-y-3"
                    >
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">SKU</span>
                            <span className="text-foreground font-medium">{product.sku}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Availability</span>
                            <span className={`font-medium ${!outOfStock ? "text-green-600" : "text-destructive"}`}>
                                {!outOfStock ? "In Stock" : "Out of Stock"}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            {/* </div> */}
        </motion.div>
    );
};

export default ProductView;
