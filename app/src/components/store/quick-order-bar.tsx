import { ChevronUp, MessageCircle, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { SelectedItem } from "@/hooks/useQuickOrderSelection";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useConfig } from "@/providers/store-provider";
import { useNavigate } from "@tanstack/react-router";

interface QuickOrderBarProps {
    items: SelectedItem[];
    onRemove: (variantId: number) => void;
    onQuantityChange: (variantId: number, quantity: number) => void;
    onClear: () => void;
    isSyncing?: boolean;
}

function buildMessage(items: SelectedItem[], origin: string): string {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const lines = items.map((item, index) => {
        const name = item.label ? `${item.name} (${item.label})` : item.name;
        return `${index + 1}. ${name} × ${item.quantity} — ${currency(item.price * item.quantity)}\n   ${origin}/products/${item.slug}`;
    });
    return `Hello! I'd like to order the following items:\n\n${lines.join("\n\n")}\n\nSubtotal: ${currency(total)}\n\nPlease confirm availability and delivery fee. Thank you!`;
}

export function QuickOrderBar({ items, onRemove, onQuantityChange, onClear, isSyncing = false }: QuickOrderBarProps) {
    const { whatsapp } = useConfig();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [visible, setVisible] = useState(items.length > 0);
    const [exiting, setExiting] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    const hasItems = items.length > 0;

    useEffect(() => {
        if (hasItems) {
            setVisible(true);
            setExiting(false);
            return;
        }
        if (!visible) return;
        setExiting(true);
        const timeout = window.setTimeout(() => {
            setVisible(false);
            setExiting(false);
            setExpanded(false);
        }, 250);
        return () => window.clearTimeout(timeout);
    }, [hasItems, visible]);

    useEffect(() => {
        const element = barRef.current;
        if (!visible || !element) return;
        const root = document.documentElement;
        const update = () => root.style.setProperty("--quick-bar-h", `${element.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => {
            observer.disconnect();
            root.style.removeProperty("--quick-bar-h");
        };
    }, [visible, expanded, items.length, checkingOut]);

    if (!visible) return null;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const sendToWhatsApp = () => {
        if (!items.length) return;
        const base = whatsapp ? `https://wa.me/${whatsapp}` : "https://wa.me/";
        const url = `${base}?text=${encodeURIComponent(buildMessage(items, window.location.origin))}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const checkoutOnWebsite = async () => {
        if (!items.length || checkingOut || isSyncing) return;
        setCheckingOut(true);
        try {
            await navigate({ to: "/checkout" });
        } finally {
            setCheckingOut(false);
        }
    };

    return (
        <div
            ref={barRef}
            className={cn(
                "fixed inset-x-0 bottom-[calc(var(--bottom-nav-h,0px)_*_var(--chrome-visible,1))] z-30 border-t border-border bg-background/95 px-3 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/85 transition-[bottom] duration-300 md:pb-[max(0.75rem,env(safe-area-inset-bottom))] [html[data-quick-order]_&]:pb-[max(0.75rem,env(safe-area-inset-bottom))] [html[data-chrome-hidden]_&]:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                exiting ? "animate-quick-order-exit pointer-events-none" : "animate-quick-order-enter"
            )}
        >
            <div className="mx-auto max-w-6xl">
                <div
                    id="quick-order-list"
                    aria-hidden={!expanded}
                    className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", expanded ? "mb-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
                >
                    <div className="min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between pb-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected items</p>
                            <button type="button" onClick={onClear} disabled={!expanded} className="text-xs text-muted-foreground underline underline-offset-2">Clear cart</button>
                        </div>
                        <ul className="max-h-[38vh] divide-y divide-border overflow-y-auto overscroll-contain">
                            {items.map((item) => (
                                <li key={item.variantId} className="flex items-center gap-3 py-2">
                                    {item.image ? <img src={item.image} alt="" loading="lazy" className="h-14 w-11 shrink-0 rounded-md bg-muted object-cover" /> : <div className="h-14 w-11 shrink-0 rounded-md bg-muted" />}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.label ? `${item.label} · ` : ""}{currency(item.price)} each</p>
                                        <div className="mt-1 inline-flex items-center rounded-full border bg-background/70">
                                            <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => onQuantityChange(item.variantId, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground disabled:opacity-30">−</button>
                                            <span className="min-w-6 text-center text-xs font-medium tabular-nums">{item.quantity}</span>
                                            <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => onQuantityChange(item.variantId, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground">+</button>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => onRemove(item.variantId)} aria-label={`Remove ${item.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90">
                                        <X className="h-5 w-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="quick-order-list" className="min-w-0 flex-1 rounded-lg py-1 text-left outline-none">
                        <span className="flex items-center gap-1 text-sm font-semibold">{items.length} selected · {unitCount} {unitCount === 1 ? "unit" : "units"} <ChevronUp className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} /></span>
                        <span className="block text-xs text-muted-foreground">{currency(total)} · Review</span>
                    </button>
                    <Button type="button" variant="outline" size="lg" aria-label="Order via WhatsApp" disabled={!whatsapp} onClick={sendToWhatsApp} className="h-11 gap-1.5 rounded-xl border-emerald-700 px-3 text-emerald-800 hover:bg-emerald-50">
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden xs:inline">WhatsApp</span>
                    </Button>
                    <Button type="button" size="lg" disabled={ checkingOut || isSyncing} onClick={checkoutOnWebsite} className="h-11 rounded-xl px-3.5">
                        <ShoppingBag className="h-4 w-4" />
                        {checkingOut ? "Preparing…" : isSyncing ? "Syncing…" : "Checkout"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
