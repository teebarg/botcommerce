import type React from "react";
import { useState } from "react";
import DeliveryStep from "./delivery-step";
import PaymentStep from "./payment-step";
import CheckoutStepIndicator from "./checkout-step-indicator";
import type { Cart } from "@/schemas";

export type CheckoutStep = "delivery" | "payment";

interface CheckoutFlowProps {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ cart }) => {
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("delivery");

    const getCompletedSteps = (): CheckoutStep[] => {
        const completed: CheckoutStep[] = [];

        if (cart.shipping_method) {
            completed.push("delivery");
        }

        if (cart.status == "CONVERTED") {
            completed.push("payment");
        }

        return completed;
    };

    const handleStepChange = (step: CheckoutStep) => {
        setCurrentStep(step);
    };

    const renderStep = () => {
        const stepToRender = currentStep;

        switch (stepToRender) {
            case "delivery":
                return (
                    <DeliveryStep
                        cart={cart}
                        onComplete={() => setCurrentStep("payment")}
                    />
                );
            case "payment":
                return (
                    <PaymentStep
                        cart={cart}
                        onBack={() => setCurrentStep("delivery")}
                    />
                );
            default:
                return null;
        }
    };

    const completedSteps = getCompletedSteps();
    const activeStep = currentStep;

    return (
        <div className="w-full flex-1 flex flex-col overflow-hidden">
            <CheckoutStepIndicator completedSteps={completedSteps} currentStep={activeStep} onStepClick={handleStepChange} />
            {renderStep()}
        </div>
    );
};

export default CheckoutFlow;
