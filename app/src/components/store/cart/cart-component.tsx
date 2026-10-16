import { useOverlayTriggerState } from "react-stately";
import type React from "react";
import CartDetails from "@/components/store/cart/cart-details";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { useCart } from "@/providers/cart-provider";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "@/utils/cn";
import { TAB_ITEM_CLASS, TabIcon } from "@/components/layout/TabIcon";


interface CartComponentProps {
    variant?: "icon" | "tab";
}

const CartComponent: React.FC<CartComponentProps> = ({ variant = "icon" }) => {
    const state = useOverlayTriggerState({});
    const { cart, cartCount } = useCart();

    const trigger =
        variant === "tab" ? (
            <button
                type="button"
                data-status={state.isOpen ? "active" : undefined}
                aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
                className={TAB_ITEM_CLASS}
            >
                <TabIcon className={cn(cartCount > 0 && "text-accent")}>
                    <ShoppingCart className="h-7 w-7" />
                    {cartCount > 0 && (
                        <span className="absolute -top-0.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-medium text-accent-foreground">
                            {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    )}
                </TabIcon>
                Cart
            </button>
        ) : (
            <Button size="icon" variant="ghost" className={cn(cartCount > 0 && "text-accent")}>
                <ShoppingCart className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                </span>
            </Button>
        );

    return (
        <Overlay
            open={state.isOpen}
            onOpenChange={state.setOpen}
            title={
                <>
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <span className="text-base">{`Your Cart (${cartCount})`}</span>
                </>
            }
            trigger={trigger}
        >
            {state.isOpen && <CartDetails cart={cart!} onClose={state.close} />}
        </Overlay>
    );
};

export { CartComponent };
