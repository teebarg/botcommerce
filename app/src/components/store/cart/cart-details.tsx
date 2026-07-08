import type React from "react";
import { Info, ShoppingCart } from "lucide-react";
import CartItemComponent from "./cart-item";
import type { Cart, CartItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import CartSummary from "./cart-summary";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

interface Props {
    onClose?: () => void;
    cart: Cart | null;
}

const CartDetails: React.FC<Props> = ({ onClose, cart }) => {
    useEffect(() => {
        if (!cart) return;
        track("cart_viewed", { cart_id: cart.cart_number })
    }, [cart]);
    return (
        <div className="flex-1 flex flex-col overflow-hidden pt-2">
            {cart?.items?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <ShoppingCart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground text-center">Explore our collection and add some items!</p>
                    <Button className="mt-4 rounded-full" onClick={onClose}>
                        Continue Shopping
                    </Button>
                </div>
            ) : (
                <>
                    <p className="bg-card text-card-foreground p-2 rounded-lg flex gap-2 mx-2">
                        <Info />
                        <span className="text-sm">
                            <span className="font-semibold">{`Your items aren’t reserved`}</span>, {`checkout quickly to make sure you don’t miss out.`}
                        </span>
                    </p>
                    <div className="flex-1 bg-card overflow-y-auto rounded-xl my-4 mx-2">
                        {cart?.items?.map((item: CartItem) => (
                            <CartItemComponent key={item.variant_id} item={item} />
                        ))}
                    </div>
                    <CartSummary cart={cart!} showSecured={true} className="rounded-none border-none" />
                </>
            )}
        </div>
    );
};

export default CartDetails;
