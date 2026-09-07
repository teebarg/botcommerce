import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { currency } from "@/utils";
import type { Product, ProductImage, ProductVariant } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useUpdateVariant } from "@/hooks/useProduct";
import { ClientOnly, useRouteContext } from "@tanstack/react-router";
import { ProductVariantActions } from "@/components/products/product-variant-actions";
import ShareButton from "@/components/share";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useOverlayTriggerState } from "react-stately";
import { track } from "@/lib/analytics";
import { defaultVariant } from "@/lib/variant";
import { WishlistButton } from "./WishlistButton";
import { ProductImage as ProductImageComponent } from "./ProductImage";
import { cn } from "@/utils/cn";

interface Props {
    product: Product;
}

const ProductView: React.FC<Props> = ({ product }) => {
    const confirmState = useOverlayTriggerState({});
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const outOfStock = !product.in_stock;
    const variant = useMemo(() => defaultVariant(product), [product]);
    const images = useMemo(() => product.images, [product]);

    const { isAdmin } = useRouteContext({ strict: false });
    const updateVariant = useUpdateVariant(false);

    const handleMarkVariantOutOfStock = async (variant: ProductVariant) => {
        if (!variant?.id) return;
        const previousInventory = typeof variant.inventory === "number" ? variant.inventory : 0;

        updateVariant
            .mutateAsync({ id: variant.id, inventory: 0 })
            .then(() => {
                toast.success(`Variant ${variant.sku} marked out of stock`, {
                    action: {
                        label: "Undo",
                        onClick: async () => {
                            await updateVariant.mutateAsync({ id: variant.id, inventory: previousInventory });
                        },
                    },
                    duration: 10000,
                    onAutoClose: () => window.location.reload(),
                    onDismiss: () => window.location.reload(),
                });
            })
            .finally(() => confirmState.close());
    };

    useEffect(() => {
        track("product_viewed", { product_id: product.id });
    }, [product.id]);

    return (
        <div className="max-w-6xl mx-auto w-full md:py-8 md:px-4 md:grid md:grid-cols-2 md:gap-8 md:items-start">
            <div className="relative aspect-square md:aspect-gallery md:rounded-2xl md:overflow-hidden md:sticky md:top-16">
                {!imageLoaded && <img src="/placeholder.jpg" alt="placeholder" className="absolute inset-0 w-full h-full object-cover" />}
                <img
                    key={currentImageIndex}
                    src={product.images?.[currentImageIndex]?.image || "/placeholder.jpg"}
                    alt={product.name}
                    data-loaded={imageLoaded}
                    decoding="async"
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 opacity-0 data-[loaded=true]:opacity-100 ${
                        outOfStock ? "opacity-60 grayscale" : ""
                    }`}
                />
                {product.in_stock && <WishlistButton productId={product.id} className="absolute right-3 top-3" />}

                {product?.is_new && (
                    <span className="absolute top-4 left-4 md:top-6 md:left-6 px-3 py-1 bg-foreground text-background text-xs font-semibold rounded-full">
                        New
                    </span>
                )}

                {/* <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                    {product.images?.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-6" : "bg-white/50 w-1.5"}`}
                        />
                    ))}
                </div> */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}

                {images.length > 1 ? (
                    <div className="mt-1 flex gap-1.5 overflow-x-auto">
                        {images.map((image: ProductImage, index: number) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentImageIndex(index)}
                                aria-label={`View image ${index + 1}`}
                                className={cn("shrink-0 border", index === currentImageIndex ? "border-foreground" : "border-border")}
                            >
                                <ProductImageComponent src={image.image} alt="" className="h-20 w-16" />
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="py-6 px-4 md:px-0 space-y-5">
                <div>
                    <div className="flex items-center justify-between gap-2">
                        <h1 className="text-lg font-display font-semibold text-foreground">{product.name}</h1>
                        <div className="shrink-0">
                            <ShareButton text="Check out this product!" />
                        </div>
                    </div>
                    {variant && (
                        <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-2xl font-semibold text-foreground">{currency(variant?.price)}</span>
                            {variant?.old_price > variant?.price && (
                                <span className="text-sm text-muted-foreground line-through">{currency(variant?.old_price)}</span>
                            )}
                        </div>
                    )}
                </div>

                <ClientOnly>
                    {isAdmin && product?.in_stock ? (
                        <div className="rounded-xl border border-border overflow-hidden">
                            {product.variants?.map((v) => (
                                <div
                                    key={v.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-border last:border-0"
                                >
                                    {v.inventory > 0 && (
                                        <ConfirmDrawer
                                            open={confirmState.isOpen}
                                            onOpenChange={confirmState.setOpen}
                                            trigger={
                                                <Button size="sm" variant="destructive" className="rounded-full">
                                                    Mark out of stock
                                                </Button>
                                            }
                                            onClose={confirmState.close}
                                            onConfirm={() => handleMarkVariantOutOfStock(v)}
                                            title="Mark out of stock"
                                            description="Are you sure you want to mark this variant as out of stock?"
                                            confirmText="Confirm"
                                            isLoading={updateVariant.isPending}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </ClientOnly>

                <ProductVariantActions product={product} />

                <div className="pt-4 border-t border-border">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
            </div>
        </div>
    );
};

export default ProductView;
