
import type { ReactNode } from "react";
import type { ProductSearch, ProductVariant } from "@/schemas";

import { DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VariantPicker, useVariantSelection } from "@/components/products/variant-picker";
import { WhatsAppIcon } from "@/components/card/icons";

import { activeVariants, getPriceInfo, handleWhatsAppPurchase } from "@/lib/variant";
import { useConfig } from "@/providers/store-provider";
import { currency } from "@/utils";
import { PriceLabel } from "../price-label";

const LOW_STOCK = 5;

export const joinNames = (names: string[]) =>
    names.map((name) => name.toLowerCase()).join(" and ");

interface VariantStockStatusProps {
    variant: ProductVariant | null;
    missing: string[];
}

export function VariantStockStatus({ variant, missing }: VariantStockStatusProps) {
    if (!variant) {
        return (
            <span className={missing.length ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
                {missing.length
                    ? `Select ${joinNames(missing)} to see availability`
                    : "This combination isn't available"}
            </span>
        );
    }

    if (variant.inventory <= 0) {
        return <Badge variant="destructive">Out of stock</Badge>;
    }

    if (variant.inventory <= LOW_STOCK) {
        return <Badge variant="destructive">Only {variant.inventory} left</Badge>;
    }

    return <Badge variant="success">In stock</Badge>;
}

interface WhatsAppOrderButtonProps {
    variant: ProductVariant | null;
    product: ProductSearch;
    disabled?: boolean;
    show?: boolean;
}

export function WhatsAppOrderButton({
    variant,
    product,
    disabled = false,
    show = true,
}: WhatsAppOrderButtonProps) {
    const { whatsapp } = useConfig();

    if (!show) return null;

    const handleOrder = () => {
        if (variant && variant.inventory > 0 && whatsapp) {
            handleWhatsAppPurchase(variant, product.slug, whatsapp);
        }
    };

    return (
        <button
            type="button"
            onClick={handleOrder}
            disabled={disabled || !variant || variant.inventory <= 0 || !whatsapp}
            aria-label="Order through WhatsApp"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
            <WhatsAppIcon className="h-7 w-7 text-success-foreground" />
        </button>
    );
}

interface ProductOptionsSheetProps {
    product: ProductSearch;
    onConfirm: (variant: ProductVariant) => void;
    confirmLabel: string;
    disabled?: boolean;
    selectedIds?: Set<number>;
    showWhatsApp?: boolean;
    allowAlreadySelected?: boolean;
    children?: ReactNode;
}

export function ProductOptionsSheet({
    product,
    onConfirm,
    confirmLabel,
    disabled = false,
    selectedIds,
    showWhatsApp = true,
    allowAlreadySelected = false,
    children,
}: ProductOptionsSheetProps) {
    const available = activeVariants(product);
    const { whatsapp } = useConfig();

    const {
        options,
        variants,
        selected,
        select,
        selectedVariant,
        missing,
    } = useVariantSelection(
        product,
        available.length === 1 ? available[0] : null
    );

    const priceInfo = getPriceInfo(product);

    const inStock = !!selectedVariant && selectedVariant.inventory > 0;
    const alreadySelected = !!selectedVariant && !!selectedIds?.has(selectedVariant.id);

    const canConfirm =
        !disabled &&
        (inStock || (allowAlreadySelected && alreadySelected));

    const confirm = () => {
        if (selectedVariant && canConfirm) {
            onConfirm(selectedVariant);
        }
    };

    const confirmText = alreadySelected
        ? "Remove from selection"
        : inStock
            ? `${confirmLabel} · ${currency(selectedVariant.price)}`
            : missing.length
                ? `Select ${joinNames(missing)}`
                : "Unavailable";

    return (
        <div className="mx-auto flex w-full max-w-md flex-col">
            <div className="flex items-center gap-4 px-5 pb-4 pt-5">
                <img
                    src={product.image}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-2xl border border-border bg-muted object-cover"
                />

                <div className="min-w-0 flex-1">
                    <DrawerTitle className="line-clamp-2 text-left text-base font-semibold leading-snug">
                        {product.name}
                    </DrawerTitle>

                    <DrawerDescription className="sr-only">
                        Choose your options, then confirm your selection.
                    </DrawerDescription>

                    <div className="mt-1.5" aria-live="polite">
                        <PriceLabel
                            tone="dark"
                            size="lg"
                            {...(selectedVariant
                                ? { variant: selectedVariant }
                                : { info: priceInfo })}
                        />
                    </div>
                </div>
            </div>

            <div className="max-h-[50vh] space-y-5 overflow-y-auto border-t border-border px-5 py-5">
                <VariantPicker
                    options={options}
                    variants={variants}
                    selected={selected}
                    onSelect={select}
                />

                <div className="min-h-6" aria-live="polite">
                    <VariantStockStatus
                        variant={selectedVariant}
                        missing={missing}
                    />
                </div>

                {children}
            </div>

            <div className="flex items-center gap-2 border-t border-border px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
                <WhatsAppOrderButton
                    variant={selectedVariant}
                    product={product}
                    disabled={!inStock || !whatsapp}
                    show={showWhatsApp}
                />

                <Button
                    type="button"
                    onClick={confirm}
                    disabled={!canConfirm}
                    className="h-12 flex-1 rounded-xl bg-foreground text-base text-background hover:bg-foreground/90"
                >
                    {confirmText}
                </Button>
            </div>
        </div>
    );
}
