import { createFileRoute } from "@tanstack/react-router";
import ServerError from "@/components/generic/server-error";
import EmptyCartMessage from "@/components/store/cart/empty-message";
import { CartComponent } from "@/components/store/cart/cart-component";
import CheckoutSummary from "@/components/store/checkout/checkout-summary";
import { useCart } from "@/providers/cart-provider";
import CheckoutFlow from "@/components/store/checkout/components/checkout-flow";
import ComponentLoader from "@/components/component-loader";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { BackButton } from "@/components/back";

export const Route = createFileRoute("/checkout")({
    head: () => ({
        meta: [
            {
                name: "description",
                content: "Checkout",
            },
            {
                title: "Checkout",
            },
        ],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { cart, error, isLoading } = useCart();

    if (error) {
        return <ServerError error={error.message} scenario="checkout" stack={error.stack} />;
    }
    return (
        <div className="max-w-7xl mx-auto w-full h-screen flex flex-col overflow-hidden">
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center border-b border-border h-16 px-2.5 shrink-0"
            >
                <div className="flex items-center gap-2">
                    <BackButton />
                    <h1 className="text-xl font-bold">Checkout</h1>
                </div>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <div className="md:hidden">
                        <CartComponent />
                    </div>
                </div>
            </motion.header>{" "}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-x-8 px-2 pt-4">
                    <ComponentLoader className="rounded-md h-192 md:mt-8" />
                    <div className="relative hidden md:block">
                        <ComponentLoader className="h-192 w-full rounded-md" />
                    </div>
                </div>
            ) : !cart ? (
                <EmptyCartMessage />
            ) : (
                <main className="flex-1 flex md:gap-8 overflow-hidden">
                    <CheckoutFlow cart={cart} />
                    <div className="mb-24 md:mb-0 hidden md:block">
                        <CheckoutSummary />
                    </div>
                </main>
            )}
        </div>
    );
}
