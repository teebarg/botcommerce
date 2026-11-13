import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { ProductSearch, ProductVariant } from "@/schemas";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { VariantPicker, useVariantSelection } from "@/components/products/variant-picker";
import { currency } from "@/utils";
import { useCart } from "@/providers/cart-provider";
import { activeVariants, variantAvailable, defaultVariant, getPriceInfo, handleWhatsAppPurchase, productOptions } from "@/lib/variant";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/providers/store-provider";
import { WhatsAppIcon } from "@/components/card/icons";

const LOW_STOCK = 5;

const joinNames = (names: string[]) => names.map((name) => name.toLowerCase()).join(" and ");

// Opens from the card. The customer picks every option first, so nothing is
// added to the cart that they did not choose. Remounts on open, so it starts fresh.
function OptionsSheetBody({ product, onAdded }: { product: ProductSearch; onAdded: () => void }) {
    const { addToCart } = useCart();
    const { whatsapp } = useConfig();
    const available = activeVariants(product);
    // Only one thing can be bought: nothing to choose, so preselect it.
    const { options, variants, selected, select, selectedVariant, missing } = useVariantSelection(product, available.length === 1 ? available[0] : null);
    const { minPrice } = getPriceInfo(product);

    const inStock = !!selectedVariant && selectedVariant.inventory > 0;
    const hasDiscount = !!selectedVariant?.old_price && selectedVariant.old_price > selectedVariant.price;

    let status: React.ReactNode = <span className="text-sm text-muted-foreground">Select {joinNames(missing)} to see availability</span>;
    if (!missing.length && !selectedVariant) status = <span className="text-sm text-destructive">This combination isn't available</span>;
    if (selectedVariant) {
        status =
            selectedVariant.inventory <= 0 ? (
                <Badge variant="destructive">Out of stock</Badge>
            ) : selectedVariant.inventory <= LOW_STOCK ? (
                <Badge variant="destructive">Only {selectedVariant.inventory} left</Badge>
            ) : (
                <Badge variant="success">In stock</Badge>
            );
    }

    const add = () => {
        if (!selectedVariant || !inStock) return;
        addToCart(selectedVariant.id, 1);
        onAdded();
    };

    const orderOnWhatsApp = () => {
        if (selectedVariant && inStock && whatsapp) handleWhatsAppPurchase(selectedVariant, product.slug, whatsapp);
    };

    return (
        <div className="mx-auto flex w-full max-w-md flex-col">
            <div className="flex items-center gap-4 px-5 pb-4 pt-5">
                <img src={product.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl border border-border bg-muted object-cover" />
                <div className="min-w-0 flex-1">
                    <DrawerTitle className="line-clamp-2 text-left text-base font-semibold leading-snug">{product.name}</DrawerTitle>
                    <DrawerDescription className="sr-only">Choose your options, then add this product to your cart.</DrawerDescription>
                    <div className="mt-1.5 flex items-baseline gap-2" aria-live="polite">
                        <span className="text-xl font-semibold tracking-tight">{selectedVariant ? currency(selectedVariant.price) : `From ${currency(minPrice)}`}</span>
                        {hasDiscount && <span className="text-sm text-muted-foreground line-through">{currency(selectedVariant!.old_price!)}</span>}
                    </div>
                </div>
            </div>

            <div className="max-h-[50vh] space-y-5 overflow-y-auto border-t border-border px-5 py-5">
                <VariantPicker options={options} variants={variants} selected={selected} onSelect={select} />
                <div className="min-h-6" aria-live="polite">
                    {status}
                </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
                <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    disabled={!inStock}
                    aria-label="Order through WhatsApp"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <WhatsAppIcon className="h-7 w-7 text-success-foreground" />
                </button>
                <Button
                    type="button"
                    onClick={add}
                    disabled={!inStock}
                    className="h-12 flex-1 rounded-xl bg-foreground text-base text-background hover:bg-foreground/90"
                >
                    {inStock ? `Add to cart · ${currency(selectedVariant!.price)}` : missing.length ? `Select ${joinNames(missing)}` : "Unavailable"}
                </Button>
            </div>
        </div>
    );
}

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

    const onWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleWhatsAppPurchase(selected, product.slug, whatsapp!);
    };

    const anyInStock = (product.variants ?? []).some(variantAvailable);
    // More than one thing to choose from: the customer must pick before anything is added.
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
            // The sheet renders in a portal, but React events still bubble to the card's link. Stop them here.
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
                        <OptionsSheetBody
                            product={product}
                            onAdded={() => {
                                setSheetOpen(false);
                                flashAdded();
                            }}
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
                    addToCart(selected.id, 1);
                    flashAdded();
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
