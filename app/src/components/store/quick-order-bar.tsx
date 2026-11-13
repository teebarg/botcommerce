import { ChevronUp, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { SelectedItem } from "@/hooks/useQuickOrderSelection";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useConfig } from "@/providers/store-provider";

interface QuickOrderBarProps {
    items: SelectedItem[];
    onRemove: (variantId: number) => void;
    onClear: () => void;
    onSent: () => void;
}

function buildMessage(items: SelectedItem[], origin: string): string {
    const total = items.reduce((sum, i) => sum + i.price, 0);

    const lines = items.map((i, idx) => {
        const name = i.label ? `${i.name} (${i.label})` : i.name;
        return `${idx + 1}. ${name} — ${currency(i.price)}\n   ${origin}/products/${i.slug}?src=wa-quick`;
    });

    return `Hi 👋 I'd like to order these:\n\n${lines.join("\n")}\n\nTotal: ${currency(total)}\n\nPlease confirm availability and delivery. Thanks!`;
}

export function QuickOrderBar({
    items,
    onRemove,
    onClear,
    onSent,
}: QuickOrderBarProps) {
    const { whatsapp } = useConfig();

    const [expanded, setExpanded] = useState(false);
    const [visible, setVisible] = useState(items.length > 0);
    const [exiting, setExiting] = useState(false);

    const barRef = useRef<HTMLDivElement>(null);
    const hasItems = items.length > 0;

    // Handle entrance and exit animations
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

    // Update bottom spacing based on bar height
    useEffect(() => {
        const el = barRef.current;
        if (!visible || !el) return;

        const root = document.documentElement;

        const update = () => {
            root.style.setProperty(
                "--quick-bar-h",
                `${el.offsetHeight}px`
            );
        };

        update();

        const observer = new ResizeObserver(update);
        observer.observe(el);

        return () => {
            observer.disconnect();
            root.style.removeProperty("--quick-bar-h");
        };
    }, [visible, expanded, items.length]);

    if (!visible) return null;

    const total = items.reduce((sum, i) => sum + i.price, 0);

    function sendToWhatsApp() {
        const text = buildMessage(items, window.location.origin);

        const base = whatsapp
            ? `https://wa.me/${whatsapp}`
            : "https://wa.me/";

        window.open(
            `${base}?text=${encodeURIComponent(text)}`,
            "_blank",
            "noopener"
        );

        onSent();
    }

    return (
        <div
            ref={barRef}
            className={cn(
                "fixed inset-x-0 bottom-[calc(var(--bottom-nav-h,0px)_*_var(--chrome-visible,1))] z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] transition-[bottom] duration-300 md:pb-[max(0.75rem,env(safe-area-inset-bottom))] [html[data-quick-order]_&]:pb-[max(0.75rem,env(safe-area-inset-bottom))] [html[data-chrome-hidden]_&]:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                exiting
                    ? "animate-quick-order-exit pointer-events-none"
                    : "animate-quick-order-enter"
            )}
        >
            <div className="mx-auto max-w-6xl">

                {/* Expandable selection */}
                <div
                    id="quick-order-list"
                    aria-hidden={!expanded}
                    className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                        expanded
                            ? "mb-3 grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between pb-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Your selection
                            </p>

                            <button
                                type="button"
                                onClick={onClear}
                                disabled={!expanded}
                                className="text-xs text-muted-foreground underline underline-offset-2"
                            >
                                Clear all
                            </button>
                        </div>

                        <ul className="max-h-[40vh] divide-y divide-border overflow-y-auto overscroll-contain">
                            {items.map((item) => (
                                <li
                                    key={item.variantId}
                                    className="animate-quick-order-item flex items-center gap-3 py-2"
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt=""
                                            loading="lazy"
                                            className="h-14 w-11 shrink-0 rounded-md bg-muted object-cover"
                                        />
                                    ) : (
                                        <div className="h-14 w-11 shrink-0 rounded-md bg-muted" />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {item.name}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {item.label
                                                ? `${item.label} · `
                                                : ""}
                                            {currency(item.price)}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onRemove(item.variantId)
                                        }
                                        aria-label={`Remove ${item.name}`}
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground active:scale-90"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom action bar */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        aria-expanded={expanded}
                        aria-controls="quick-order-list"
                        className="min-w-0 flex-1 rounded-lg py-1 text-left outline-none"
                    >
                        <span className="flex items-center gap-1 text-sm font-medium">
                            {items.length} selected

                            <ChevronUp
                                className={cn(
                                    "h-4 w-4 transition-transform duration-300",
                                    expanded && "rotate-180"
                                )}
                            />
                        </span>

                        <span className="block text-xs text-muted-foreground">
                            {currency(total)}
                        </span>
                    </button>
                    <Button
                        size="lg"
                        onClick={sendToWhatsApp}
                        className="bg-emerald-700 text-white hover:bg-emerald-600 border-0 shadow-sm transition-all duration-200 active:scale-[0.97]"
                    >
                        <MessageCircle className="h-5 w-5" />
                        Send to WhatsApp
                    </Button>
                </div>
            </div>
        </div>
    );
}
