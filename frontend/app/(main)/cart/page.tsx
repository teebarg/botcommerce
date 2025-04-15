import { Metadata } from "next";
import { Shield } from "nui-react-icons";
import EmptyCartMessage from "@modules/cart/components/empty-cart-message";

import SummaryMobile from "@/modules/cart/templates/summary-mobile";
import RecommendedProducts from "@/modules/products/components/recommended";
import PromotionalBanner from "@/components/promotion";
import { api } from "@/apis";
import { CartItem } from "@/types/models";
import ServerError from "@/components/server-error";
import CartPageDetails from "@/components/cart/cart-page-details";

export const metadata: Metadata = {
    title: "Cart",
};

export default async function Cart() {
    const { data: cart, error } = await api.cart.get();

    if (error) {
        return <ServerError />;
    }

    if (!cart) {
        return <EmptyCartMessage />;
    }

    const product_ids = cart?.items?.map((x: CartItem) => x.variant_id);

    return (
        <>
            <SummaryMobile cart={cart} />
            <div className="py-0 md:py-12">
                <PromotionalBanner
                    btnClass="text-purple-600"
                    outerClass="bg-gradient-to-r from-indigo-500/100 via-purple-500/75 to-pink-500 mx-2 md:mx-auto max-w-7xl"
                    subtitle="Get up to 50% OFF on select products."
                    title="Big Sale on Top Brands!"
                />
                <div className="max-w-7xl mx-auto" data-testid="cart-container">
                    <CartPageDetails cart={cart} />
                    <div className="px-2 py-4 mt-4">
                        <div className="flex gap-2 items-center">
                            <Shield />
                            <p>Security & Privacy</p>
                        </div>
                        <div className="flex gap-4 text-default-500 text-sm">
                            <p>Safe payments</p>
                            <p>Secure personal details</p>
                        </div>
                    </div>
                    <div className="px-2 mt-4">
                        <p className="text:sm md:text-lg font-semibold">More to love</p>
                        <RecommendedProducts exclude={product_ids} />
                    </div>
                </div>
            </div>
        </>
    );
}
