import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Package, Clock, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: "confirmed" | "processing" | "shipped" | "delivered";
    orderDate: string;
    estimatedDelivery: string;
}

const OrderNotes = () => {
    const [notes, setNotes] = useState("");
    const [savedNotes, setSavedNotes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Mock order data
    const order: Order = {
        id: "ORD-2024-001",
        items: [
            { id: "1", name: "Premium Wireless Headphones", quantity: 1, price: 299.99 },
            { id: "2", name: "Bluetooth Speaker", quantity: 2, price: 89.99 },
            { id: "3", name: "Phone Case", quantity: 1, price: 24.99 },
        ],
        total: 504.96,
        status: "confirmed",
        orderDate: "2024-01-15",
        estimatedDelivery: "2024-01-20",
    };

    const handleSaveNote = async () => {
        if (!notes.trim()) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSavedNotes((prev) => [...prev, notes]);
        setNotes("");
        setIsLoading(false);

        toast.success("Note saved successfully!", {
            description: "Your order note has been added to the order.",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-blue text-white mb-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Order Notes</h1>
                    <p className="text-lg text-muted-foreground">Add special instructions or notes to your order</p>
                </div>

                <div className="">
                    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Add Order Notes</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Add special instructions, delivery preferences, or any other notes for your order.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium">
                                    Your Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="e.g., Please leave at the front door, fragile items, call before delivery..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-32 resize-none border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                />
                                <p className="text-xs text-muted-foreground">{notes.length}/500 characters</p>
                            </div>

                            <Button
                                onClick={handleSaveNote}
                                disabled={!notes.trim() || isLoading}
                                className="w-full gradient-blue hover:opacity-90 transition-opacity"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? "Saving..." : "Save Note"}
                            </Button>

                            {/* Saved Notes */}
                            {savedNotes.length > 0 && (
                                <div className="space-y-3">
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-medium mb-3">Saved Notes</h4>
                                        <ScrollArea className="h-32">
                                            <div className="space-y-2">
                                                {savedNotes.map((note, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                                    >
                                                        <p className="text-sm text-green-800 dark:text-green-200">{note}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Feature Highlights */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <Card className="border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                            <Save className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Secure Storage</h3>
                        <p className="text-sm text-muted-foreground">Your notes are securely saved and attached to your order</p>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Real-time Updates</h3>
                        <p className="text-sm text-muted-foreground">Add notes anytime and get instant confirmation</p>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Order Integration</h3>
                        <p className="text-sm text-muted-foreground">Notes are automatically shared with our fulfillment team</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderNotes;
