import React from "react";
import type { CheckoutStep } from "./checkout-flow";
import { cn } from "@/utils";
import { motion } from "framer-motion";

interface CheckoutStepIndicatorProps {
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
    onStepClick: (step: CheckoutStep) => void;
}

const CheckoutStepIndicator: React.FC<CheckoutStepIndicatorProps> = ({ currentStep, completedSteps, onStepClick }) => {
    const steps: CheckoutStep[] = ["delivery", "address", "payment"];

    return (
        <div className="p-4 bg-background/80 backdrop-blur">
            <div className="flex gap-2">
                {steps.map((step, idx) => {
                    const isCompleted = completedSteps.includes(step);
                    const isActive = currentStep === step;
                    const isClickable = isCompleted || isActive;
                    return (
                        <motion.div
                            key={idx}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-colors duration-300",
                                isClickable ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                                isCompleted ? "gradient-primary" : "bg-secondary"
                            )}
                            initial={false}
                            animate={{
                                scale: isActive ? [1, 1.1, 1] : 1,
                            }}
                            transition={{ duration: 0.3 }}
                            onClick={() => isClickable && onStepClick(step)}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {steps.map((step: CheckoutStep, idx: number) => (
                    <span key={idx} className={cn(currentStep === step && "text-primary font-medium")}>
                        {step}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default CheckoutStepIndicator;
