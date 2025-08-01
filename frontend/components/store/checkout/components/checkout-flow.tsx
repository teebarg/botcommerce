"use client";

import React, { useState } from "react";

import DeliveryStep from "./delivery-step";
import AddressStep from "./address-step";
import PaymentStep from "./payment-step";

import { useAuth } from "@/providers/auth-provider";
import CheckoutLoginPrompt from "@/components/generic/auth/checkout-auth-prompt";
import { Cart } from "@/schemas";
// import OrderCompleteStep from "./order-complete-step";

export type CheckoutStep = "auth" | "delivery" | "address" | "payment" | "complete";

interface CheckoutFlowProps {
    onClose?: () => void;
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onClose, cart }) => {
    const { isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(isAuthenticated ? "delivery" : "auth");
    const [deliveryType, setDeliveryType] = useState<"shipping" | "pickup" | null>(null);
    const [shippingAddress, setShippingAddress] = useState(null);

    const getStep = () => {
        if (!isAuthenticated) {
            return "auth";
        }
        if (!cart.shipping_method) {
            return "delivery";
        }
        if (!cart.shipping_address) {
            return "address";
        }

        return "payment";
    };

    const handleDeliverySelected = (type: "shipping" | "pickup") => {
        setDeliveryType(type);
        if (type === "pickup") {
            setCurrentStep("payment");
        } else {
            setCurrentStep("address");
        }
    };

    const handleAddressSubmitted = (address: any) => {
        setShippingAddress(address);
        setCurrentStep("payment");
    };

    const handlePaymentSubmitted = () => {
        setCurrentStep("complete");
    };

    // const handleStartShopping = () => {
    //     onClose();
    // };

    const renderStep = () => {
        switch (getStep()) {
            case "auth":
                return <CheckoutLoginPrompt />;
            case "delivery":
                return <DeliveryStep cart={cart} onDeliverySelected={handleDeliverySelected} />;
            case "address":
                return <AddressStep address={cart.shipping_address} onAddressSubmitted={handleAddressSubmitted} />;
            case "payment":
                return <PaymentStep cart={cart} deliveryType={deliveryType!} onPaymentSubmitted={handlePaymentSubmitted} />;
            // case "complete":
            //     return <OrderCompleteStep deliveryType={deliveryType!} onStartShopping={handleStartShopping} />;
            default:
                return null;
        }
    };

    return <div className="">{renderStep()}</div>;
};

export default CheckoutFlow;
