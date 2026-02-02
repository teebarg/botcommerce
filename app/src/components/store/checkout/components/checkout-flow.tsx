import type React from "react";
import { useState } from "react";
import DeliveryStep from "./delivery-step";
import AddressStep from "./address-step";
import PaymentStep from "./payment-step";
import CheckoutStepIndicator from "./checkout-step-indicator";
import CheckoutLoginPrompt from "@/components/generic/auth/checkout-auth-prompt";
import type { Cart } from "@/schemas";
import { useRouteContext } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export type CheckoutStep = "auth" | "delivery" | "address" | "payment";

interface CheckoutFlowProps {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
}

const steps: CheckoutStep[] = ["auth", "delivery", "address", "payment"];

const stepMobileVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? "-100%" : "100%",
        opacity: 0,
    }),
};

const stepDesktopVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
        scale: 0.98,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -50 : 50,
        opacity: 0,
        scale: 0.98,
    }),
};

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ cart }) => {
    const isMobile = useIsMobile();
    const { session } = useRouteContext({ strict: false });
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("auth");
    const [direction, setDirection] = useState(1);
    const stepVariants = isMobile ? stepMobileVariants : stepDesktopVariants;

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

    const handleStepChange = (step: CheckoutStep) => {
        if (steps.indexOf(step) > steps.indexOf(currentStep)) {
            setDirection(1);
        } else {
            setDirection(-1);
        }
        setCurrentStep(step);
    };

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
        <div className="w-full flex-1 flex flex-col">
            {session && <CheckoutStepIndicator completedSteps={completedSteps} currentStep={activeStep} onStepClick={handleStepChange} />}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        type: isMobile ? "spring" : "tween",
                        stiffness: 300,
                        damping: 30,
                        duration: isMobile ? undefined : 0.3,
                    }}
                    className="flex flex-col flex-1 pt-4"
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CheckoutFlow;
