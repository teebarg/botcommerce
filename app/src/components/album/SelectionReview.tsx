import React, { useState } from "react";
import { X, Trash2, MessageCircle, CheckCircle2 } from "lucide-react";
import LazyImage from "./LazyImage";
import { currency } from "@/utils";
import { albumConfig } from "@/data/albumConfig";
import { Button } from "../ui/button";
import { useConfig } from "@/providers/store-provider";
import { CampaignProduct } from "@/server/product.server";

export interface SelectionReviewProps {
    open: boolean;
    onClose: () => void;
    selectedProducts: CampaignProduct[];
    onRemove: (id: string | number) => void;
    onClear: () => void;
}

interface SubmittedOrderItem {
    id: string | number;
    name: string;
    price: number;
}

interface SubmittedOrder {
    items: SubmittedOrderItem[];
    total: number;
}

export default function SelectionReview({ open, onClose, selectedProducts, onRemove, onClear }: SelectionReviewProps) {
    const { whatsapp } = useConfig();
    const [submitted, setSubmitted] = useState<boolean>(false);

    const total = selectedProducts.reduce((sum, p) => sum + (p.price ?? 0), 0);

    const buildWhatsAppMessage = (): string => {
        const lines = selectedProducts.map((p) => `• ${p.name} — ${currency(p.price ?? 0)}`);
        return `Hello ${albumConfig.title}!\n\nI'd like to order:\n${lines.join("\n")}\n\n` + `Total: ${currency(total)}\n\n`;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const order: SubmittedOrder = {
            items: selectedProducts.map((p) => ({ id: p.id, name: p.name, price: p.price ?? 0 })),
            total,
        };
        console.log("Order submitted:", order);

        setSubmitted(true);
    };

    const openWhatsApp = () => {
        const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
        window.open(url, "_blank");
    };

    const handleClose = () => {
        setSubmitted(false);
        onClose();
    };

    const handleDone = () => {
        onClear();
        setSubmitted(false);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose} />

            <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl bg-background p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />

                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl">{submitted ? "Order Sent" : "Your Selection"}</h2>
                    <button onClick={handleClose} aria-label="Close" className="rounded-full p-1.5 text-muted-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {submitted ? (
                    <div className="mt-8 flex flex-col items-center text-center">
                        <CheckCircle2 className="h-14 w-14 text-green-600" />
                        <p className="mt-4">Your selection has been recorded. Send it to the seller on WhatsApp to confirm your order.</p>
                        <button
                            onClick={openWhatsApp}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 font-medium text-white transition-transform active:scale-95"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Open WhatsApp
                        </button>
                        <Button onClick={handleDone} className="mt-3 w-full rounded-full h-12" variant="outline">
                            Done
                        </Button>
                    </div>
                ) : (
                    <>
                        {selectedProducts.length === 0 ? (
                            <p className="mt-6 text-center text-muted-foreground">No items selected yet. Tap the + on any product to add it.</p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {selectedProducts.map((p) => (
                                    <li key={p.id} className="flex items-center gap-3">
                                        <div className="h-16 w-14 shrink-0">
                                            <LazyImage src={p.image} alt={p.name} aspect="4/5" className="rounded-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-serif text-base">{p.name}</p>
                                            <p className="font-mono text-sm text-muted-foreground">{currency(p.price ?? 0)}</p>
                                        </div>
                                        <Button aria-label="Remove item" onClick={() => onRemove(p.id)} variant="ghost" size="iconOnly">
                                            <Trash2 className="h-6 w-6" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                            <span className="text-sm uppercase tracking-widest text-muted-foreground">Total</span>
                            <span className="font-mono text-xl font-semibold">{currency(total)}</span>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                            <Button
                                type="submit"
                                disabled={selectedProducts.length === 0}
                                className="w-full rounded-full text-base py-3.5"
                                variant="inverse"
                                size="lg"
                            >
                                Submit Selection
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
