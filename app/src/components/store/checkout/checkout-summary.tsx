import { Separator } from "@/components/ui/separator";
import CartSummary from "../cart/cart-summary";
import { Cart, CartItem } from "@/schemas";
import CartItemComponent from "../cart/cart-item";
import { AlertTriangle } from "lucide-react";

const CheckoutSummary: React.FC<{ cart: Cart }> = ({ cart }) => {
    const outOfStockItems = cart.items?.filter((item: CartItem) => item.variant?.status === "OUT_OF_STOCK");
    return (
        <div className="relative md:sticky md:top-0 px-2 py-4 md:w-[400px] hidden md:block min-w-0 overflow-hidden">
            <h2 className="font-medium">Cart Summary</h2>
            <Separator className="my-2" />
            {outOfStockItems.length > 0 && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-destructive">Action required</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {outOfStockItems.length === 1
                                ? "1 item in your cart is out of stock."
                                : `${outOfStockItems.length} items in your cart are out of stock.`}{" "}
                            Remove {outOfStockItems.length === 1 ? "it" : "them"} to continue.
                        </p>
                    </div>
                </div>
            )}
            <CartSummary cart={cart!} />
            <div className="max-h-[55vh] w-full bg-card overflow-y-auto rounded-xl mt-4">
                {cart?.items?.map((item: CartItem) => (
                    <CartItemComponent key={item.variant_id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default CheckoutSummary;
