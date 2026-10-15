import { MessageCircle, X } from "lucide-react";
import type { ProductSearch } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { defaultVariant, getPriceInfo, variantLabel } from "@/lib/variant";

// Your store's WhatsApp number in international format without "+", e.g. 2348012345678
const WHATSAPP_NUMBER = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

interface QuickOrderBarProps {
    items: ProductSearch[];
    onClear: () => void;
}

function buildMessage(items: ProductSearch[], origin: string): { text: string; total: number } {
    let total = 0;
    const lines = items.map((p, i) => {
        const price = getPriceInfo(p).minPrice;
        total += price;
        const label = variantLabel(defaultVariant(p));
        const name = label ? `${p.name} (${label})` : p.name;
        return `${i + 1}. ${name} — ${currency(price)}\n   ${origin}/products/${p.slug}?src=wa-quick`;
    });

    const text = `Hi 👋 I'd like to order these:\n\n${lines.join("\n")}\n\nTotal: ${currency(
        total
    )}\n\nPlease confirm availability and delivery. Thanks!`;
    return { text, total };
}

export function QuickOrderBar({ items, onClear }: QuickOrderBarProps) {
    if (items.length === 0) return null;

    const total = items.reduce((sum, p) => sum + getPriceInfo(p).minPrice, 0);

    function sendToWhatsApp() {
        // Built on click, so window is always available (no SSR concerns)
        const { text } = buildMessage(items, window.location.origin);
        const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
        window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                        {items.length} selected · {currency(total)}
                    </p>
                    <button
                        type="button"
                        onClick={onClear}
                        className="flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
                    >
                        <X className="h-3 w-3" />
                        Clear
                    </button>
                </div>
                <Button size="lg" onClick={sendToWhatsApp}>
                    <MessageCircle />
                    Send to WhatsApp
                </Button>
            </div>
        </div>
    );
}
