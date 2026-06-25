import { createFileRoute } from "@tanstack/react-router";
import ServerError from "@/components/generic/server-error";
import { CartComponent } from "@/components/store/cart/cart-component";
import CheckoutSummary from "@/components/store/checkout/checkout-summary";
import { useCart } from "@/providers/cart-provider";
import CheckoutFlow from "@/components/store/checkout/components/checkout-flow";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackButton } from "@/components/back";
import { meQuery } from "@/queries/user.queries";
import { useEffect } from "react";
import { gtag } from "@/utils/gtag";
import { SignInRedirect } from "@/utils/reuseable";
import { PageLoader } from "@/components/generic/page-loader";
import EmptyState from "@/components/generic/empty";
import { BtnLink } from "@/components/ui/btnLink";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/checkout")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
    },
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(meQuery());
    },
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
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return <SignInRedirect />;
        }

        throw error;
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { cart, error, isLoading } = useCart();

    useEffect(() => {
        if (!cart) return;

        gtag.beginCheckout({
            cart_id: cart.cart_number,
            value: cart.total,
            items: cart.items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    }, [cart]);

    if (error) {
        return <ServerError error={error.message} scenario="checkout" stack={error.stack} />;
    }
    return (
        <div className="max-w-7xl mx-auto w-full flex flex-col overflow-hidden">
            <header className="sticky h-16 top-0 z-50 bg-background/60 flex justify-between items-center border-b border-border px-2.5 shrink-0">
                <div className="flex items-center gap-2">
                    <BackButton />
                    <h1 className="text-lg font-bold">Checkout</h1>
                </div>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <div className="md:hidden">
                        <CartComponent />
                    </div>
                </div>
            </header>{" "}
            {isLoading ? (
                <PageLoader variant="detail" className="px-4 py-4" />
            ) : !cart ? (
                <EmptyState
                    title="Your cart is empty"
                    description="Continue shopping to explore more."
                    action={
                        <BtnLink className="mt-4 rounded-full text-sm" href="/collections">
                            Continue Shopping
                        </BtnLink>
                    }
                    icon={ShoppingCart}
                />
            ) : (
                <main className="flex overflow-hidden h-sc">
                    <CheckoutFlow cart={cart} />
                    <CheckoutSummary cart={cart} />
                </main>
            )}
        </div>
    );
}
