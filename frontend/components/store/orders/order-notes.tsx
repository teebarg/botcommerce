"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Order } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import { api } from "@/apis/client";
import { useQueryClient } from "@tanstack/react-query";

interface OrderNotesProp {
    order: Order;
}

const OrderNotes: React.FC<OrderNotesProp> = ({ order }) => {
    const [notes, setNotes] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const handleSaveNote = async () => {
        if (!notes.trim()) return;

        setIsLoading(true);
        const { error } = await tryCatch(api.patch(`/order/${order.id}/notes`, { notes }));
        setIsLoading(false);

        if (error) {
            toast.error(error);
            return;
        }
        queryClient.invalidateQueries({ queryKey: ["order", order.order_number] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        setNotes("");

        toast.success("Note saved successfully!", {
            description: "Your order note has been added to the order.",
        });
    };

    if (!order) {
        return null;
    }


    if (order.order_notes) {
        return <div className="py-12 px-2 bg-content1">
            <h2 className="text-lg font-semibold">Notes</h2>
            <p className="text-sm text-muted-foreground">{order.order_notes}</p>
        </div>;
    }

    return (
        <Card className="border-0 shadow-lg bg-content1">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Add Order Notes</CardTitle>
                <p className="text-sm text-muted-foreground">Add special instructions, delivery preferences, or any other notes for your order.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium" htmlFor="notes">
                        Your Notes
                    </Label>
                    <Textarea
                        className="min-h-32"
                        id="notes"
                        placeholder="e.g., Please leave at the front door, fragile items, call before delivery..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{notes.length}/500 characters</p>
                </div>

                <Button className="w-full" disabled={!notes.trim() || isLoading} onClick={handleSaveNote} variant="primary">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Note"}
                </Button>
            </CardContent>
        </Card>
    );
};

export default OrderNotes;
