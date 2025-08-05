"use client";

import React, { useState, useCallback } from "react";

import DeliveryStep from "./delivery-step";
import AddressStep from "./address-step";
import PaymentStep from "./payment-step";
import CheckoutStepIndicator from "./checkout-step-indicator";

import { useAuth } from "@/providers/auth-provider";
import CheckoutLoginPrompt from "@/components/generic/auth/checkout-auth-prompt";
import { Cart } from "@/schemas";
import { cn } from "@/lib/utils";

export type CheckoutStep = "auth" | "delivery" | "address" | "payment";

interface CheckoutFlowProps {
    onClose?: () => void;
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onClose, cart }) => {
    const { isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("auth");

    const getStep = () => {
        if (!isAuthenticated) {
            return "auth";
        }
        if (!cart.shipping_method) {
            return "delivery";
        }
        if (cart.shipping_method === "PICKUP") {
            return "payment";
        }
        if (!cart.shipping_address) {
            return "address";
        }

        return "payment";
    };

    const getCompletedSteps = (): CheckoutStep[] => {
        const completed: CheckoutStep[] = [];

        if (isAuthenticated) {
            completed.push("auth");
        }

        if (cart.shipping_method) {
            completed.push("delivery");
        }

        if (cart.shipping_method !== "PICKUP" && cart.shipping_address) {
            completed.push("address");
        }

        if (cart.payment_method) {
            completed.push("payment");
        }

        return completed;
    };

    const handleStepChange = useCallback((step: CheckoutStep) => {
        setCurrentStep(step);
    }, []);

    const renderStep = () => {
        const stepToRender = currentStep === "auth" ? getStep() : currentStep;

        switch (stepToRender) {
            case "auth":
                return <CheckoutLoginPrompt />;
            case "delivery":
                return (
                    <DeliveryStep
                        cart={cart}
                        onComplete={() => {
                            if (cart.shipping_method === "PICKUP") {
                                setCurrentStep("payment");
                            } else {
                                setCurrentStep("address");
                            }
                        }}
                    />
                );
            case "address":
                return <AddressStep address={cart.shipping_address} onComplete={() => setCurrentStep("payment")} />;
            case "payment":
                return (
                    <PaymentStep
                        cart={cart}
                        onBack={() => {
                            if (cart.shipping_method === "PICKUP") {
                                setCurrentStep("delivery");
                            } else {
                                setCurrentStep("address");
                            }
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const completedSteps = getCompletedSteps();
    const activeStep = currentStep === "auth" ? getStep() : currentStep;

    return (
        <div className="space-y-6">
            <CheckoutStepIndicator cart={cart} completedSteps={completedSteps} currentStep={activeStep} onStepClick={handleStepChange} />
            <div className={cn("transition-all duration-300", isAuthenticated ? "animate-fade-in" : "")}>{renderStep()}</div>
        </div>
    );
};

export default CheckoutFlow;
