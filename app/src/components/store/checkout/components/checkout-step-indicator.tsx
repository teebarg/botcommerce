import React from "react";
import { Truck, MapPin, CreditCard, User } from "lucide-react";
import type { CheckoutStep } from "./checkout-flow";
import { cn } from "@/utils";
import { motion } from "framer-motion";

interface CheckoutStepIndicatorProps {
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
    onStepClick: (step: CheckoutStep) => void;
}

const stepConfig = {
    auth: {
        title: "Account",
        icon: User,
        description: "Sign in or create account",
    },
    delivery: {
        title: "Delivery",
        icon: Truck,
        description: "Choose delivery method",
    },
    address: {
        title: "Address",
        icon: MapPin,
        description: "Enter shipping address",
    },
    payment: {
        title: "Payment",
        icon: CreditCard,
        description: "Choose payment method",
    },
};

const CheckoutStepIndicator: React.FC<CheckoutStepIndicatorProps> = ({ currentStep, completedSteps, onStepClick }) => {
    const steps: CheckoutStep[] = ["delivery", "address", "payment"];

    return (
        <div className="px-4 py-4 sticky top-16 z-10 bg-background/80 backdrop-blur">
            <div className="flex gap-2">
                {steps.map((step, idx) => {
                    const config = stepConfig[step];
                    const Icon = config.icon;
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

    // return (
    //     <div className="w-full bg-secondary border border-border rounded-lg py-4 px-1 mb-6 sticky z-20 top-16">
    //         <div className="flex items-center justify-between">
    //             {steps.map((step: CheckoutStep, index: number) => {
    //                 const config = stepConfig[step];
    //                 const Icon = config.icon;
    //                 const isCompleted = completedSteps.includes(step);
    //                 const isActive = currentStep === step;
    //                 const isClickable = isCompleted || isActive;

    //                 return (
    //                     <React.Fragment key={step}>
    //                         <div className="flex flex-col items-center">
    //                             <button
    //                                 className={cn(
    //                                     "flex flex-col items-center gap-1 px-2 py-3 rounded-lg transition-all duration-200 text-muted-foreground",
    //                                     isClickable ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
    //                                     isActive && "bg-primary/10 text-primary"
    //                                 )}
    //                                 disabled={!isClickable}
    //                                 onClick={() => isClickable && onStepClick(step)}
    //                             >
    //                                 <div className="relative">
    //                                     {isCompleted ? (
    //                                         <CheckCircle className="h-6 w-6 text-primary" />
    //                                     ) : (
    //                                         <div
    //                                             className={cn(
    //                                                 "h-6 w-6 rounded-full flex items-center justify-center",
    //                                                 isActive ? "border-primary bg-primary text-white" : "border-muted-foreground"
    //                                             )}
    //                                         >
    //                                             {isActive ? <Icon className="h-3 w-3" /> : <Circle className="h-4 w-4" />}
    //                                         </div>
    //                                     )}
    //                                 </div>
    //                                 <div className="text-center">
    //                                     <div className={cn("text-sm font-medium", isActive && "", isCompleted && "text-primary")}>{config.title}</div>
    //                                     <div className="text-xs text-muted-foreground hidden sm:block">{config.description}</div>
    //                                 </div>
    //                             </button>
    //                         </div>
    //                         {index < steps.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
    //                     </React.Fragment>
    //                 );
    //             })}
    //         </div>
    //     </div>
    // );
};

export default CheckoutStepIndicator;
