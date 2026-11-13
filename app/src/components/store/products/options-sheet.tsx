import type { ProductSearch, ProductVariant } from "@/schemas";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VariantPicker, useVariantSelection } from "@/components/products/variant-picker";
import { activeVariants, getPriceInfo, handleWhatsAppPurchase } from "@/lib/variant";
import { useConfig } from "@/providers/store-provider";
import { currency } from "@/utils";
import { PriceLabel } from "../price-label";
import { WhatsAppIcon } from "@/components/card/icons";

const LOW_STOCK = 5;

const joinNames = (names: string[]) => names.map((name) => name.toLowerCase()).join(" and ");

interface OptionsSheetBodyProps {
    product: ProductSearch;
    onConfirm: (variant: ProductVariant) => void;
    confirmLabel: string;
    selectedIds?: Set<number>;
    showWhatsApp?: boolean;
}

function OptionsSheetBody({ product, onConfirm, confirmLabel, selectedIds, showWhatsApp = true }: OptionsSheetBodyProps) {
    console.log("OptionsSheetBody product:", product.variants);
    const { whatsapp } = useConfig();
    const available = activeVariants(product);
    // Only one thing can be bought: nothing to choose, so preselect it.
    const { options, variants, selected, select, selectedVariant, missing } = useVariantSelection(product, available.length === 1 ? available[0] : null);
    const priceInfo = getPriceInfo(product);

    const inStock = !!selectedVariant && selectedVariant.inventory > 0;

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

    const alreadySelected = !!selectedVariant && !!selectedIds?.has(selectedVariant.id);
    const canConfirm = inStock || alreadySelected;

    const confirm = () => {
        if (selectedVariant && canConfirm) onConfirm(selectedVariant);
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
                    <div className="mt-1.5" aria-live="polite">
                        <PriceLabel tone="dark" size="lg" {...(selectedVariant ? { variant: selectedVariant } : { info: priceInfo })} />
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
                {showWhatsApp && (
                    <button
                        type="button"
                        onClick={orderOnWhatsApp}
                        disabled={!inStock}
                        aria-label="Order through WhatsApp"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <WhatsAppIcon className="h-7 w-7 text-success-foreground" />
                    </button>
                )}
                <Button
                    type="button"
                    onClick={confirm}
                    disabled={!canConfirm}
                    className="h-12 flex-1 rounded-xl bg-foreground text-base text-background hover:bg-foreground/90"
                >
                    {alreadySelected ? "Remove from selection" : inStock ? `${confirmLabel} · ${currency(selectedVariant!.price)}` : missing.length ? `Select ${joinNames(missing)}` : "Unavailable"}
                </Button>
            </div>
        </div>
    );
}


interface OptionsSheetProps extends Omit<OptionsSheetBodyProps, "product"> {
    product: ProductSearch | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OptionsSheet({ product, open, onOpenChange, onConfirm, ...rest }: OptionsSheetProps) {
    return (
        <Drawer open={open && !!product} onOpenChange={onOpenChange}>
            <DrawerContent className="rounded-t-3xl">
                {product && (
                    <OptionsSheetBody
                        product={product}
                        onConfirm={(variant) => {
                            onConfirm(variant);
                            onOpenChange(false);
                        }}
                        {...rest}
                    />
                )}
            </DrawerContent>
        </Drawer>
    );
}
