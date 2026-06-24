import type React from "react";
import { ShoppingBag, Check } from "lucide-react";

const PaymentLoading: React.FC = () => {
    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md border border-border rounded-xl overflow-hidden bg-card">

                <div className="px-8 py-7 border-b border-border">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                        Checkout
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0 w-9 h-9">
                            <svg
                                className="absolute inset-0 animate-spin"
                                width="36"
                                height="36"
                                viewBox="0 0 36 36"
                            >
                                <circle
                                    cx="18" cy="18" r="15"
                                    fill="none"
                                    className="stroke-border"
                                    strokeWidth="2"
                                />
                                <circle
                                    cx="18" cy="18" r="15"
                                    fill="none"
                                    className="stroke-foreground"
                                    strokeWidth="2"
                                    strokeDasharray="30 70"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                        </div>
                        <div>
                            <h1 className="text-base font-medium text-foreground">Processing your order</h1>
                            <p className="text-sm text-muted-foreground">Please wait while we verify your payment</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    <div className="flex flex-col">
                        <ProcessStep
                            title="Payment received"
                            description="Your payment has been successfully received"
                            status="completed"
                            isLast={false}
                        />
                        <ProcessStep
                            title="Order verification"
                            description="We're verifying your order details"
                            status="active"
                            isLast={false}
                        />
                        <ProcessStep
                            title="Order confirmation"
                            description="Your order will be confirmed shortly"
                            status="pending"
                            isLast={true}
                        />
                    </div>
                </div>

                <div className="px-8 py-4 bg-muted/40 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                        Estimated time
                    </span>
                    <span className="text-xs text-muted-foreground">~30 seconds</span>
                </div>
            </div>
        </div>
    );
};

interface ProcessStepProps {
    title: string;
    description: string;
    status: "completed" | "active" | "pending";
    isLast: boolean;
}

function ProcessStep({ title, description, status, isLast }: ProcessStepProps) {
    return (
        <div className="flex gap-3.5">
            <div className="flex flex-col items-center shrink-0">
                {status === "completed" && (
                    <div className="w-5 h-5 rounded-full bg-success-subtle flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-success-subtle-foreground" />
                    </div>
                )}
                {status === "active" && (
                    <div className="w-5 h-5 rounded-full border-[1.5px] border-foreground flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                    </div>
                )}
                {status === "pending" && (
                    <div className="w-5 h-5 rounded-full border-[1.5px] border-border shrink-0" />
                )}
                {!isLast && (
                    <div className="w-px flex-1 mt-1.5 mb-1.5 bg-border" />
                )}
            </div>
            <div className={`pt-0.5 ${!isLast ? "pb-5" : ""}`}>
                <p className={`text-sm font-medium mb-0.5 ${
                    status === "completed"
                        ? "text-success-subtle-foreground"
                        : status === "active"
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                }`}>
                    {title}
                </p>
                <p className={`text-xs leading-relaxed ${
                    status === "pending" ? "text-muted-foreground/40" : "text-muted-foreground"
                }`}>
                    {description}
                </p>
            </div>
        </div>
    );
}

export default PaymentLoading;
