import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { SelectedItem } from "@/hooks/useQuickOrderSelection";

// Your store's WhatsApp number in international format without "+", e.g. 2348012345678
const WHATSAPP_NUMBER = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

interface QuickOrderBarProps {
    items: SelectedItem[];
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


export function QuickOrderBar({ items, onClear, onSent }: QuickOrderBarProps) {
    if (items.length === 0) return null;
 
    const total = items.reduce((sum, i) => sum + i.price, 0);
 
    function sendToWhatsApp() {
        // Built on click, so window is always available (no SSR concerns)
        const text = buildMessage(items, window.location.origin);
        const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
        window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
        onSent();
    }
 
    return (
        <div className="fixed inset-x-0 bottom-[var(--bottom-nav-h,0px)] z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                        {items.length} selected · {currency(total)}
                    </p>
                    <button type="button" onClick={onClear} className="flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2">
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
