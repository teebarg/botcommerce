import { useOverlayTriggerState } from "react-stately";
import type React from "react";
import CartDetails from "@/components/store/cart/cart-details";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { useCart } from "@/providers/cart-provider";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useCartSummary } from "@/hooks/useCartSummary";
import { cn } from "@/utils/cn";

const CartComponent: React.FC = () => {
    const state = useOverlayTriggerState({});
    const { cart } = useCart();
    const { totalItems } = useCartSummary();

    return (
        <Overlay
            open={state.isOpen}
            onOpenChange={state.setOpen}
            title={
                <>
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <span className="text-base">{`Your Cart (${totalItems})`}</span>
                </>
            }
            trigger={
                <Button size="icon" variant="ghost" className={cn(totalItems > 0 && "text-accent")}>
                    <ShoppingCart className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {totalItems}
                    </span>
                </Button>
            }
        >
            {state.isOpen && <CartDetails cart={cart!} onClose={state.close} />}
        </Overlay>
    );
};

export { CartComponent };
