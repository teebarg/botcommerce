import React, { useState, useEffect } from "react";
import { ArrowUpRight, ChevronRight, Truck } from "lucide-react";
import { toast } from "sonner";

import { cn, currency } from "@/lib/utils";
import LocalizedClientLink from "@/components/ui/link";
import ProductShare from "@/components/product/product-share";
import { ProductImage, ProductVariant } from "@/schemas";
import { ProductVariantSelection } from "@/components/product/product-variant-selection";
import { Product } from "@/schemas/product";
import { UserInteractionType, useTrackUserInteraction } from "@/hooks/useUserInteraction";
import { ProductCollectionIndicator } from "@/components/admin/shared-collections/product-collection-indicator";
import { Button } from "@/components/ui/button";
import { useUpdateVariant } from "@/hooks/useProduct";
import ImageDisplay from "@/components/image-display";
import MediaDisplay from "@/components/media-display";
import { useRouteContext } from "@tanstack/react-router";

interface Props {
    product: Product;
}

const ProductView: React.FC<Props> = ({ product }) => {
    const [selectedImageId, setSelectedImageId] = useState<number>(product.images[0]?.id || 0);

    const selectedImage = product.images.find((img: ProductImage) => img.id === selectedImageId) || product.images[0];

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);

    const { session } = useRouteContext({ strict: false });
    const trackInteraction = useTrackUserInteraction();
    const updateVariant = useUpdateVariant(false);

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

            handleUserInteraction("VIEW", { timeSpent });
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

    return (
        <div className="max-w-7xl mx-auto h-full w-full md:my-8">
            <nav className="hidden md:block mb-4" data-slot="base">
                <ol className="flex flex-wrap list-none rounded-lg" data-slot="list">
                    <li className="flex items-center" data-slot="base">
                        <LocalizedClientLink href="/">Home</LocalizedClientLink>
                    </li>
                    <li className="flex items-center" data-slot="base">
                        <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                            <ChevronRight />
                        </span>
                        <LocalizedClientLink href="/collections">Collection</LocalizedClientLink>
                    </li>
                    {product?.name && (
                        <li className="flex items-center" data-slot="base">
                            <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                <ChevronRight />
                            </span>
                            <span>{product.name}</span>
                        </li>
                    )}
                </ol>
            </nav>
            <div className="relative flex flex-col lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                <div className="relative h-full w-full flex-none flex flex-col-reverse md:flex-row gap-2 md:gap-4">
                    <div className="flex flex-wrap md:flex-col gap-4 px-2 md:px-0">
                        {product.images
                            ?.sort((a, b) => a.order - b.order)
                            ?.map((image: ProductImage, idx: number) => (
                                <button
                                    key={idx}
                                    className={`w-16 h-16 rounded-md shrink-0 border-2 overflow-hidden relative ${
                                        selectedImageId === image.id ? "border-indigo-500" : "border-gray-200"
                                    }`}
                                    onClick={() => setSelectedImageId(image.id)}
                                >
                                    <ImageDisplay alt={image.image} url={image.image} />
                                </button>
                            ))}
                    </div>
                    <div className="flex-1">
                        <div className="h-[60vh] flex items-center justify-center p-4 relative">
                            <MediaDisplay
                                alt={product.name}
                                className="object-contain rounded"
                                url={selectedImage?.image || product.images?.[0]?.image}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col px-2 md:px-0 mt-6 md:mt-0">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold tracking-tight">{product.name}</h1>
                        <div className="flex items-center gap-2">
                            <ProductCollectionIndicator product={product} />
                            <ProductShare name={product.name} />
                        </div>
                    </div>
                    <div className={cn("text-4xl font-bold", selectedVariant ? "hidden md:block" : "hidden")}>{currency(selectedVariant?.price)}</div>
                    <div className={cn("bg-orange-800 py-4 px-4 md:hidden -mx-2 mb-4 mt-2", selectedVariant ? "" : "hidden")}>
                        <div className="flex items-center text-white">
                            <span className="text-3xl font-semibold">{currency(selectedVariant?.price)}</span>
                            {selectedVariant?.old_price > selectedVariant?.price && (
                                <span className="ml-1 text-sm line-through">{currency(selectedVariant?.old_price)}</span>
                            )}
                        </div>
                        {selectedVariant?.old_price > selectedVariant?.price && (
                            <div className="mt-1 -mb-1.5">
                                <span className="text-xl font-medium text-orange-400">
                                    Save {(((selectedVariant?.old_price - selectedVariant?.price) / selectedVariant?.old_price) * 100).toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </div>

                    <ProductVariantSelection product={product} onVariantChange={setSelectedVariant} />

                    <div className="mt-4">
                        <p className="line-clamp-3 text-base text-muted-foreground">{product.description}</p>
                    </div>
                    {session?.user?.isAdmin && product?.variants?.length ? (
                        <div className="flex flex-col gap-2 mt-4">
                            {product.variants.map((v) => (
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
                    <div className="mt-6 flex flex-col gap-1">
                        <LocalizedClientLink
                            className="inline-flex items-center text-sm hover:opacity-80 transition-opacity my-2 text-muted-foreground"
                            href={"/"}
                        >
                            See guide
                            <ArrowUpRight />
                        </LocalizedClientLink>
                    </div>
                    <div className="text-sm py-8 bg-yellow-50 text-yellow-950 -mx-4 px-4 md:px-2 rounded-none md:rounded-lg space-y-4">
                        <div className="flex items-start gap-x-2">
                            <Truck className="h-6 w-6" />
                            <div>
                                <span className="font-semibold">Fast delivery</span>
                                <p className="max-w-sm">
                                    Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home.
                                </p>
                            </div>
                        </div>
                        {/* <div className="flex items-start gap-x-2">
                            <RefreshCw className="h-6 w-6" />
                            <div>
                                <span className="font-semibold">Simple exchanges</span>
                                <p className="max-w-sm">Is the fit not quite right? No worries - we&apos;ll exchange your product for a new one.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-x-2">
                            <Backpack className="h-6 w-6" />
                            <div>
                                <span className="font-semibold">Easy returns</span>
                                <p className="max-w-sm">
                                    Just return your product and we&apos;ll refund your money. No questions asked – we&apos;ll do our best to make
                                    sure your return is hassle-free.
                                </p>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductView;
