import type React from "react";
import { Info, ShoppingCart } from "lucide-react";
import CartItemComponent from "./cart-item";
import type { Cart, CartItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CartSummary from "./cart-summary";

interface Props {
    onClose?: () => void;
    cart: Cart | null;
    shippingFee?: number;
}

const CartDetails: React.FC<Props> = ({ onClose, cart, shippingFee }) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden py-2">
            {cart?.items && cart?.items?.length > 0 && (
                <p className="bg-card text-card-foreground p-2 rounded flex gap-2 mx-4" data-testid="urgentMessage-read">
                    <Info />
                    <span className="text-sm">
                        <span className="font-semibold">{`Your items aren’t reserved`}</span>, {`checkout quickly to make sure you don’t miss out.`}
                    </span>
                </p>
            )}
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
                    <ScrollArea className="flex-1 px-4 py-4">
                        <div className="rounded-xl border bg-card overflow-hidden">
                            {cart?.items?.map((item: CartItem) => (
                                <CartItemComponent key={item.variant_id} item={item} />
                            ))}
                        </div>
                    </ScrollArea>
                    <CartSummary cart={cart!} />
                </>
            )}
        </div>
    );
};

export default CartDetails;
