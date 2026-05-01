import type React from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";

const PaymentLoading: React.FC = () => {
    return (
        <div className="min-h-screen bg-linear-to-b from-violet-50 to-violet-100 flex items-center justify-center p-4 fixed inset-0 z-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <div className="relative animate-in zoom-in-0 duration-500">
                            <div className="w-24 h-24 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
                            <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-500 w-10 h-10" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Processing Your Order</h2>

                    <p className="text-gray-600 text-center mb-8">Please wait while we verify your payment</p>

                    <div className="space-y-4">
                        <ProcessStep description="Your payment has been successfully received" isCompleted={true} title="Payment Received" />
                        <ProcessStep
                            description="We're verifying your order details"
                            isActive={true}
                            isCompleted={false}
                            title="Order Verification"
                        />
                        <ProcessStep description="Your order will be confirmed shortly" isCompleted={false} title="Order Confirmation" />
                    </div>
                </div>

                <div className="bg-violet-50 p-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Order</span>
                        <span>Estimated time: 30 seconds</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ProcessStepProps {
    title: string;
    description: string;
    isCompleted: boolean;
    isActive?: boolean;
}

function ProcessStep({ title, description, isCompleted, isActive = false }: ProcessStepProps) {
    return (
        <div className="flex items-start space-x-4">
            <div className="shrink-0">
                {isCompleted ? (
                    <div className="animate-in zoom-in-0 duration-300">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                ) : (
                    <div className={`w-6 h-6 rounded-full border-2 ${isActive ? "border-violet-500" : "border-gray-300"}`}>
                        {isActive && (
                            <div className="w-full h-full rounded-full bg-violet-500 animate-pulse" />
                        )}
                    </div>
                )}
            </div>
            <div>
                <h3 className={`font-medium ${isCompleted ? "text-green-500" : isActive ? "text-violet-500" : "text-gray-400"}`}>{title}</h3>
                <p className={`text-sm ${isCompleted || isActive ? "text-gray-600" : "text-gray-400"}`}>{description}</p>
            </div>
        </div>
    );
}

export default PaymentLoading;
