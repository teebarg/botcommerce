import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CartItem } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { currency } from "@/lib/util/util";

interface Props {
    onClose: () => void;
    items: CartItem[];
}

const CartDetails: React.FC<Props> = ({ onClose, items }) => {
    const [mounted, setMounted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + shipping;

    if (!mounted) return null;

    const updateQuantity = async (id: number, quantity: number) => {
        // if (!isInStock) {
        //     toast.error("Product out of stock")
        //     return;
        // }

        setLoading(true);
        try {
            const response = await api.cart.changeQuantity({
                item_id: id,
                quantity,
            });

            if (response.error) {
                toast.error(response.error);

                return;
            }

            toast.success("Added to cart successfully");
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (id: number) => {
        setLoading(true);
        try {
            const response = await api.cart.delete(id);

            if (response.error) {
                toast.error(response.error);

                return;
            }

            toast.success("Item removed from cart successfully");
        } catch (error) {
            toast.error("Failed to remove item from cart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {/* Cart Drawer */}
            <motion.div
                animate={{ y: 0 }}
                className="rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col"
                exit={{ y: "100%" }}
                initial={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                {/* Header */}
                <div className="p-4 border-b border-default-100 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-default-700" />
                        <h2 className="font-semibold text-lg">Your Cart ({items.length})</h2>
                    </div>
                    <Button size="icon" variant="ghost" onClick={onClose}>
                        <X className="h-5 w-5 text-default-600" />
                    </Button>
                </div>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <ShoppingCart className="h-12 w-12 text-default-300 mb-4" />
                            <p className="text-default-500">Your cart is empty</p>
                            <Button className="mt-4 rounded-full" onClick={onClose}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item: CartItem, idx: number) => (
                                <motion.div
                                    key={idx}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center space-x-4"
                                    exit={{ opacity: 0, height: 0 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-default-100">
                                        <img alt={item.variant.name} className="h-full w-full object-cover object-center" src={item.image} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium">{item.variant.name}</h3>
                                        <p className="mt-1 text-sm font-semibold">{currency(Number(item.price) || 0)}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <div className="flex items-center border rounded-full overflow-hidden h-8">
                                            <button
                                                className="px-2 h-full flex items-center justify-center"
                                                disabled={loading}
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                className="px-2 h-full flex items-center justify-center"
                                                disabled={loading}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <button
                                            className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                {items.length > 0 && (
                    <motion.div animate={{ opacity: 1, y: 0 }} className="p-4 border-t space-y-3" initial={{ opacity: 0, y: 20 }}>
                        <div className="flex justify-between text-sm">
                            <span className="text-default-600">Subtotal</span>
                            <span>{currency(Number(subtotal) || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-default-600">Shipping</span>
                            <span>{shipping === 0 ? "Free" : `${currency(Number(shipping) || 0)}`}</span>
                        </div>
                        <div className="flex justify-between font-medium text-base pt-2 border-t">
                            <span>Total</span>
                            <span>{currency(Number(total) || 0)}</span>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-medium transition-colors mt-4">
                            Checkout
                        </button>
                        <button className="w-full text-blue-600 py-2 text-sm hover:underline" onClick={onClose}>
                            Continue Shopping
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default CartDetails;
