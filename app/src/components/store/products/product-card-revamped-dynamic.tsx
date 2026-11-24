import type React from "react";
import type { ProductSearch } from "@/schemas/product";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Check, Info, Maximize2, Plus } from "lucide-react";
import { getPriceInfo, productOptions } from "@/lib/variant";
import LazyImage from "@/components/LazyImage";
import { PriceLabel } from "../price-label";
import { useProductAttributes } from "@/hooks/useProductAttributes";
import { useNavigate } from "@tanstack/react-router";

interface ProductCardProps {
    product: ProductSearch;
    className?: string;
    onClick?: () => void;
    selected?: boolean;
    onSelect?: () => void;
    onChoose?: () => void;
    priority?: boolean;
}

/** Image-first shopping card: tap selects/adds to cart; long press opens details. */
const ProductCard: React.FC<ProductCardProps> = ({ product, className, onClick, selected = false, onSelect, onChoose, priority = false }) => {
    const { attributes } = useProductAttributes(product?.variants);
    const navigate = useNavigate();
    const pressTimer = useRef<number | null>(null);
    const pressStart = useRef<{ x: number; y: number } | null>(null);
    const suppressClick = useRef(false);
    const priceInfo = useMemo(() => getPriceInfo(product), [product]);
    const { hasDiscount, discountLabel } = priceInfo;
    const outOfStock = !product.in_stock;
    const showDiscountBadge = !outOfStock && hasDiscount;
    const hasChoices = productOptions(product).length > 0 && (product.variants?.length ?? 0) > 1;


    const cancelLongPress = useCallback(() => {
        if (pressTimer.current !== null) {
            window.clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    }, []);
    const startLongPress = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== "touch" || outOfStock) return;
        if (event.target instanceof Element && event.target.closest("button, a")) return;
        pressStart.current = { x: event.clientX, y: event.clientY };
        suppressClick.current = false;
        cancelLongPress();
        pressTimer.current = window.setTimeout(() => {
            suppressClick.current = true;
            navigate({ to: "/products/$slug", params: { slug: product.slug } });
        }, 520);
    }, [cancelLongPress, navigate, outOfStock, product.slug]);
    const moveLongPress = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (!pressStart.current) return;
        if (Math.hypot(event.clientX - pressStart.current.x, event.clientY - pressStart.current.y) > 10) cancelLongPress();
    }, [cancelLongPress]);
    const endLongPress = useCallback(() => {
        cancelLongPress();
        pressStart.current = null;
    }, [cancelLongPress]);
    useEffect(() => endLongPress, [endLongPress]);

    return (
        <div
            id={`product-${product.id}`}
            role="group"
            tabIndex={outOfStock ? -1 : 0}
            aria-label={product.name}
            onPointerDown={startLongPress}
            onPointerMove={moveLongPress}
            onPointerUp={endLongPress}
            onPointerCancel={endLongPress}
            onContextMenu={(event) => event.preventDefault()}
            onClick={(event) => {
                event.preventDefault();
                if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                }
                if (outOfStock) return;
                if (hasChoices) onChoose?.();
                else onSelect?.();
            }}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget && event.key !== "Escape") return;
                if ((event.key === "Enter" || event.key === " ") && !outOfStock) {
                    event.preventDefault();
                    if (hasChoices) onChoose?.();
                    else onSelect?.();
                }
            }}
            className={cn(
                "relative overflow-hidden bg-muted touch-pan-y select-none cursor-pointer",
                "transition-[box-shadow,transform] duration-200 active:scale-[0.985]",
                outOfStock && "opacity-65 grayscale cursor-not-allowed",
                className,
            )}
        >
            <LazyImage src={product.image} alt={product.name} aspect="4/5.6" priority={priority} />
            {outOfStock && <div className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium tracking-wide text-background">Sold out</span></div>}

            {!outOfStock && (
                <button
                    type="button"
                    aria-label={`${selected ? "Remove" : "Add"} ${product.name} ${selected ? "from cart" : "to cart"}`}
                    aria-pressed={selected}
                    onClick={(event) => {
                        event.preventDefault(); event.stopPropagation();
                        if (hasChoices) onChoose?.(); else onSelect?.();
                    }}
                    className={cn("absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all",
                        selected ? "border-emerald-700 bg-emerald-700 text-white" : "border-white/50 bg-black/30 text-white backdrop-blur-sm")}
                >
                    {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
            )}

            {!outOfStock && (
                <button
                    type="button"
                    aria-label={`View details for ${product.name}`}
                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); navigate({ to: "/products/$slug", params: { slug: product.slug } }); }}
                    className="absolute left-2 top-11 z-20 flex h-8 items-center gap-1 rounded-full bg-black/45 px-2.5 text-xs font-medium text-white backdrop-blur-sm"
                >
                    <Info className="h-3.5 w-3.5" /> Details
                </button>
            )}
            {!outOfStock && onClick && (
                <button type="button" aria-label={`View photos of ${product.name}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onClick(); }}
                    className="absolute right-2 bottom-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                    <Maximize2 className="h-4 w-4" />
                </button>
            )}

            <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-10 px-2 pb-2 pt-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent", outOfStock && "from-black/50")}>
                <div className="sr-only">{product.name}</div>
                {product.is_new && <Badge variant="success" className="mt-1 w-fit uppercase tracking-wider" type="sm">New</Badge>}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <PriceLabel info={priceInfo} tone="light" size="lg" />
                    {showDiscountBadge && <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">{discountLabel}</span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                    {attributes.slice(0, 3).map((attr: string, index: number) => <span key={index} className="rounded-xs bg-white/15 px-1.5 py-0.5 text-[9px] font-medium text-white/90">{attr}</span>)}
                    {attributes.length > 3 && <span className="px-1 text-[9px] font-medium text-white/70">+{attributes.length - 3}</span>}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
