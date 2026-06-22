import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Order } from "@/schemas";
import { tryCatch } from "@/utils/try-catch";
import { api } from "@/utils/api";

export default function OrderNotes({ order }: { order: Order }) {
    const [notes, setNotes] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveNote = async () => {
        if (!notes.trim()) return;
        setIsLoading(true);
        const { error } = await tryCatch(api.patch<Order>(`/order/${order.id}/notes`, { notes }));
        setIsLoading(false);

        if (error) {
            toast.error(error);
            return;
        }
        setNotes("");
        toast.success("Note saved", { description: "Your note has been added to the order." });
    };

    if (!order) return null;

    if (order.order_notes) {
        return (
            <div className="rounded-xl border bg-card p-4 mb-4">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Notes</p>
                <p className="text-sm text-foreground">{order.order_notes}</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card p-4 mb-4">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Add a note</p>
            <p className="text-xs text-muted-foreground mb-3">Special instructions or delivery preferences.</p>
            <Textarea
                className="min-h-24 mb-2"
                placeholder="e.g. Please leave at the front door, call before delivery..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
            />
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{notes.length}/500</span>
                <Button size="sm" className="rounded-full" disabled={!notes.trim() || isLoading} onClick={handleSaveNote}>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {isLoading ? "Saving…" : "Save note"}
                </Button>
            </div>
        </div>
    );
}