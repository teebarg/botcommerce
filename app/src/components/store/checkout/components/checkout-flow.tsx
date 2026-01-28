import type React from "react";
import { useState, useCallback } from "react";

import DeliveryStep from "./delivery-step";
import AddressStep from "./address-step";
import PaymentStep from "./payment-step";
import CheckoutStepIndicator from "./checkout-step-indicator";
import CheckoutLoginPrompt from "@/components/generic/auth/checkout-auth-prompt";
import type { Cart } from "@/schemas";
import { useRouteContext } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

export type CheckoutStep = "auth" | "delivery" | "address" | "payment";

interface CheckoutFlowProps {
    onClose?: () => void;
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onClose, cart }) => {
    const { session } = useRouteContext({ strict: false });
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("auth");

    const getStep = () => {
        if (!session) {
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

        if (session) {
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
                return (
                    <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="">
                        <CheckoutLoginPrompt />
                    </motion.div>
                );
            case "delivery":
                return (
                    <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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
                    </motion.div>
                );
            case "address":
                return (
                    <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <AddressStep address={cart.shipping_address} onComplete={() => setCurrentStep("payment")} />
                    </motion.div>
                );
            case "payment":
                return (
                    <motion.div key="payment" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
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
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const completedSteps = getCompletedSteps();
    const activeStep = currentStep === "auth" ? getStep() : currentStep;

    return (
        <div className="space-y-6">
            {session && <CheckoutStepIndicator completedSteps={completedSteps} currentStep={activeStep} onStepClick={handleStepChange} />}
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
    );
};

export default CheckoutFlow;
