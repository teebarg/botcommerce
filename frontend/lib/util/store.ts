import { CartItem } from "@/types/models";

const subtotal = (items: CartItem[]) => items?.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
const taxTotal = (items: CartItem[]) => items?.reduce((total: number, item: CartItem) => total + item.price * item.quantity * 0.05, 0);
const total = (items: CartItem[], deliveryFee: number) => subtotal(items) + deliveryFee + taxTotal(items);

export { subtotal, taxTotal, total };
