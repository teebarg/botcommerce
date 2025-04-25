"use client";

import React from "react";
import { Shield } from "nui-react-icons";

import EmptyCartMessage from "./empty-message";

import { useCart } from "@/lib/hooks/useCart";
import ServerError from "@/components/generic/server-error";
import { Skeleton } from "@/components/generic/skeleton";
import SummaryMobile from "@/components/store/cart/summary-mobile";
import RecommendedProducts from "@/components/store/products/recommended";
import PromotionalBanner from "@/components/promotion";
import { CartItem } from "@/types/models";
import CartPageDetails from "@/components/store/cart/cart-page-details";

interface Props {}

const CartView: React.FC<Props> = () => {
    const { data: cart, isLoading, error } = useCart();

    console.log("🚀 ~ cart:", cart);

    if (isLoading) {
        return <Skeleton className="h-[400px]" />;
    }

    if (error) {
        return <ServerError />;
    }

    if (!cart) {
        return (
            <div className="py-24">
                <EmptyCartMessage />
            </div>
        );
    }

    const product_ids = cart?.items?.map((x: CartItem) => x.variant_id);

    return (
        <div>
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
        </div>
    );
};

export default CartView;
