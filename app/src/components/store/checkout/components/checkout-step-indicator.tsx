import React from "react";
import { Check } from "lucide-react";
import type { CheckoutStep } from "./checkout-flow";
import { cn } from "@/utils/cn";

interface CheckoutStepIndicatorProps {
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
    onStepClick: (step: CheckoutStep) => void;
}

const stepLabels: Record<CheckoutStep, string> = {
    delivery: "Delivery & address",
    payment: "Contact & payment",
};

const CheckoutStepIndicator: React.FC<CheckoutStepIndicatorProps> = ({ currentStep, completedSteps, onStepClick }) => {
    const steps: CheckoutStep[] = ["delivery", "payment"];
    const currentIndex = steps.indexOf(currentStep);

    return (
        <div className="px-4 py-4 bg-background/60">
            <div className="flex items-center">
                {steps.map((step, idx) => {
                    const isCompleted = completedSteps.includes(step);
                    const isActive = currentStep === step;
                    const isFilled = isCompleted || isActive;
                    const isClickable = isCompleted || isActive;

                    return (
                        <React.Fragment key={step}>
                            <button
                                type="button"
                                aria-current={isActive ? "step" : undefined}
                                disabled={!isClickable}
                                onClick={() => isClickable && onStepClick(step)}
                                className={cn(
                                    "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold font-display transition-all duration-300",
                                    isFilled
                                        ? "bg-gradient-primary text-accent-foreground shadow-[0_0_16px_hsl(var(--accent)/0.3)]"
                                        : "bg-secondary text-muted-foreground",
                                    isClickable ? "cursor-pointer" : "cursor-not-allowed"
                                )}
                            >
                                {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : idx + 1}
                            </button>

                            {idx < steps.length - 1 && (
                                <div className="mx-2 h-[3px] flex-1 rounded-full bg-secondary overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full bg-gradient-primary transition-all duration-500 ease-out",
                                            idx < currentIndex || isCompleted ? "w-full" : "w-0"
                                        )}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="flex justify-between mt-2">
                {steps.map((step) => {
                    const isActive = currentStep === step;
                    return (
                        <span
                            key={step}
                            className={cn(
                                "text-2xs uppercase tracking-wide transition-colors duration-300",
                                isActive ? "text-foreground font-medium" : "text-muted-foreground"
                            )}
                        >
                            {stepLabels[step]}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckoutStepIndicator;