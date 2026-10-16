import { ChevronUp, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { SelectedItem } from "@/hooks/useQuickOrderSelection";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useConfig } from "@/providers/store-provider";

interface QuickOrderBarProps {
    items: SelectedItem[];
    onRemove: (id: number) => void;
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

export function QuickOrderBar({ items, onRemove, onClear, onSent }: QuickOrderBarProps) {
    const { whatsapp } = useConfig();
    const [expanded, setExpanded] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    const hasItems = items.length > 0;

    useEffect(() => {
        if (!hasItems) setExpanded(false);
    }, [hasItems]);

    useEffect(() => {
        const el = barRef.current;
        if (!hasItems || !el) return;
        const root = document.documentElement;
        const update = () => root.style.setProperty("--quick-bar-h", `${el.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.removeProperty("--quick-bar-h");
        };
    }, [hasItems]);

    if (!hasItems) return null;

    const total = items.reduce((sum, i) => sum + i.price, 0);

    function sendToWhatsApp() {
        const text = buildMessage(items, window.location.origin);
        const base = whatsapp ? `https://wa.me/${whatsapp}` : "https://wa.me/";
        window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
        onSent();
    }

    return (
        <div
            ref={barRef}
            className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h,0px)_*_var(--chrome-visible,1))] z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md transition-[bottom] duration-300 motion-reduce:transition-none md:pb-[max(0.75rem,env(safe-area-inset-bottom))] [html[data-quick-order]_&]:pb-[max(0.75rem,env(safe-area-inset-bottom))] [html[data-chrome-hidden]_&]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
            <div className="mx-auto max-w-6xl">
                {expanded && (
                    <div id="quick-order-list" className="mb-3">
                        <div className="flex items-center justify-between pb-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your selection</p>
                            <button type="button" onClick={onClear} className="text-xs text-muted-foreground underline underline-offset-2">
                                Clear all
                            </button>
                        </div>
                        <ul className="max-h-[40vh] divide-y divide-border overflow-y-auto overscroll-contain">
                            {items.map((item) => (
                                <li key={item.id} className="flex items-center gap-3 py-2">
                                    {item.image ? (
                                        <img src={item.image} alt="" loading="lazy" className="h-14 w-11 shrink-0 rounded-md bg-muted object-cover" />
                                    ) : (
                                        <div className="h-14 w-11 shrink-0 rounded-md bg-muted" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.label ? `${item.label} · ` : ""}
                                            {currency(item.price)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(item.id)}
                                        aria-label={`Remove ${item.name}`}
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
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
                            <ChevronUp className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                        </span>
                        <span className="block text-xs text-muted-foreground">{currency(total)}</span>
                    </button>
                    <Button size="lg" onClick={sendToWhatsApp}>
                        <MessageCircle />
                        Send to WhatsApp
                    </Button>
                </div>
            </div>
        </div>
    );
}
