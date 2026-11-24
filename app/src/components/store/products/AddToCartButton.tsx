import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { ProductSearch, ProductVariant } from "@/schemas";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useCart } from "@/providers/cart-provider";
import { variantAvailable, defaultVariant, handleWhatsAppPurchase, productOptions } from "@/lib/variant";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/providers/store-provider";
import { WhatsAppIcon } from "@/components/card/icons";
import { ProductOptionsSheet } from "./product-options-sheet";

export function AddToCartButton({ product, productVariant }: { product: ProductSearch; productVariant?: ProductVariant | undefined }) {
    const { addToCart } = useCart();
    const { whatsapp } = useConfig();
    const [added, setAdded] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const selected = productVariant ?? defaultVariant(product);

    const flashAdded = () => {
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
    };

    const add = (variant: ProductVariant) => {
        addToCart(variant.id, 1);
        setSheetOpen(false);
        flashAdded();
    };

    const onWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleWhatsAppPurchase(selected, product.slug, whatsapp!);
    };

    const anyInStock = (product.variants ?? []).some(variantAvailable);
    const needsChoice = productOptions(product).length > 0 && (product.variants?.length ?? 0) > 1;

    if (!selected || !anyInStock) {
        return (
            <div className="py-2 px-2.5">
                <Button disabled className="w-full uppercase tracking-[0.16em]" variant="outline">
                    Out of stock
                </Button>
            </div>
        );
    }

    if (needsChoice) {
        return (
            <div className="py-2 px-2.5" onClick={(event) => event.stopPropagation()}>
                <Button
                    onClick={(event) => {
                        event.preventDefault();
                        setSheetOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    aria-haspopup="dialog"
                >
                    {added ? (
                        <>
                            <Check className="h-3.5 w-3.5" strokeWidth={1.6} /> Added
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.6} /> Choose options
                        </>
                    )}
                </Button>
                <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
                    <DrawerContent className="rounded-t-3xl">
                        <ProductOptionsSheet
                            product={product}
                            confirmLabel="Add to cart"
                            onConfirm={add}
                        />
                    </DrawerContent>
                </Drawer>
            </div>
        );
    }

    return (
        <div className="flex gap-2 py-2 px-2.5">
            <Button
                onClick={(event) => {
                    event.preventDefault();
                    add(selected);
                }}
                aria-label="Add to cart"
                variant="outline"
                className="flex-1"
                size="sm"
            >
                {added ? (
                    <>
                        <Check className="h-3.5 w-3.5" strokeWidth={1.6} /> Added
                    </>
                ) : (
                    "Add to cart"
                )}
            </Button>
            <button onClick={onWhatsApp} aria-label="Buy on WhatsApp" className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                <WhatsAppIcon className="w-7 h-7 text-success-foreground" />
            </button>
        </div>
    );
}
