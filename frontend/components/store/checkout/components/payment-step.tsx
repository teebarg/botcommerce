import React, { useState } from "react";
import { CreditCard, Lock, Banknote } from "lucide-react";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { paymentInfoMap } from "@lib/constants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroupItem, RadioGroupWithLabel } from "@/components/ui/radio-group";
import { Cart, PaymentMethod } from "@/schemas";
import { useStore } from "@/app/store/use-store";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";

const payMethods: { id: string; provider_id: PaymentMethod }[] = [
    { id: "pickup", provider_id: "CASH_ON_DELIVERY" },
    { id: "manual", provider_id: "BANK_TRANSFER" },
    { id: "paystack", provider_id: "PAYSTACK" },
];

interface PaymentStepProps {
    deliveryType: "shipping" | "pickup";
    onPaymentSubmitted: () => void;
    cart: Cart | null;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ deliveryType, onPaymentSubmitted, cart }) => {
    const { shopSettings } = useStore();
    const updateCartDetails = useUpdateCartDetails();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        nameOnCard: "",
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const isOpen = searchParams.get("step") === "payment";

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    const hasPaymentMethod = !!cart?.payment_method && !!cart?.shipping_method;

    // Mock cart items
    const cartItems = [
        { id: 1, name: "Designer Dress", price: 299.99, quantity: 1 },
        { id: 2, name: "Luxury Handbag", price: 189.99, quantity: 1 },
    ];

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = deliveryType === "shipping" ? (subtotal > 50 ? 0 : 9.99) : 0;
    const tax = (subtotal + shipping) * 0.08;
    const total = subtotal + shipping + tax;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Mock payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsProcessing(false);
        onPaymentSubmitted();
    };

    const handleInputChange = (field: string, value: string) => {
        setPaymentForm((prev) => ({ ...prev, [field]: value }));
    };

    const isFormValid =
        paymentMethod === "transfer" ||
        (paymentForm.cardNumber && paymentForm.expiryMonth && paymentForm.expiryYear && paymentForm.cvv && paymentForm.nameOnCard);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams);

            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );

    const handleChange = (providerId: PaymentMethod) => {
        updateCartDetails.mutate({ payment_method: providerId });
    };

    const handleEdit = () => {
        router.push(pathname + "?" + createQueryString("step", "payment"), {
            scroll: false,
        });
    };

    // const handleSubmit = () => {
    //     router.push(pathname + "?" + createQueryString("step", "review"), {
    //         scroll: false,
    //     });
    // };

    const handlePaystackPayment = () => {
        setIsProcessing(true);

        // Simulate Paystack payment processing
        setTimeout(() => {
            setIsProcessing(false);
        }, 2000);
    };

    return (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-elegant animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
                        <CreditCard className="h-6 w-6 text-accent" />
                        <span>Payment Details</span>
                    </CardTitle>
                    <CardDescription>Choose your payment method and complete your order</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* <div className="space-y-4">
                            <Label className="text-base font-medium">Payment Method</Label>
                            <RadioGroup value={paymentMethod} onValueChange={(value: "card" | "transfer") => setPaymentMethod(value)}>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/10 transition-colors">
                                    <RadioGroupItem id="card" value="card" />
                                    <Label className="flex items-center space-x-2 cursor-pointer flex-1" htmlFor="card">
                                        <CreditCard className="h-4 w-4" />
                                        <span>Credit/Debit Card</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/10 transition-colors">
                                    <RadioGroupItem id="transfer" value="transfer" />
                                    <Label className="flex items-center space-x-2 cursor-pointer flex-1" htmlFor="transfer">
                                        <Banknote className="h-4 w-4" />
                                        <span>Bank Transfer</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div> */}

                        <RadioGroupWithLabel
                            className="grid grid-cols-1 md:grid-cols-3 gap-2"
                            label="Payment Method"
                            value={cart?.payment_method || ""}
                            onValueChange={(value: string) => handleChange(value as PaymentMethod)}
                        >
                            {payMethods.map((item: { id: string; provider_id: PaymentMethod }, idx: number) => {
                                if (
                                    (item.provider_id === "CASH_ON_DELIVERY" && shopSettings?.payment_cash != "true") ||
                                    (item.provider_id === "BANK_TRANSFER" && shopSettings?.payment_bank != "true") ||
                                    (item.provider_id === "PAYSTACK" && shopSettings?.payment_paystack != "true") ||
                                    (cart?.shipping_method !== "PICKUP" && item.provider_id === "CASH_ON_DELIVERY")
                                ) {
                                    return null;
                                }

                                return (
                                    <RadioGroupItem key={idx} value={item.provider_id} variant="card">
                                        <div className="flex items-center gap-3">
                                            <div className="shrink-0 mt-0.5">{paymentInfoMap[item.provider_id]?.icon}</div>
                                            <div className="text-left">
                                                <div className="font-medium text-default-900">{paymentInfoMap[item.provider_id]?.title}</div>
                                                <div className="text-sm text-default-500">{paymentInfoMap[item.provider_id]?.description}</div>
                                            </div>
                                        </div>
                                    </RadioGroupItem>
                                );
                            })}
                        </RadioGroupWithLabel>

                        {paymentMethod === "card" && (
                            <div className="space-y-6">
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <div className="w-8 h-8 bg-green-600 rounded text-white text-sm flex items-center justify-center font-bold">
                                            PS
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Pay with Paystack</h3>
                                    <p className="text-gray-600 mb-6">Secure payment processing with Paystack</p>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-xl">
                                    <h4 className="font-medium text-gray-900 mb-4">Payment Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Amount:</span>
                                            <span className="font-medium">${total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Currency:</span>
                                            <span className="font-medium">USD</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="font-medium">Paystack Gateway</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isProcessing}
                                    onClick={handlePaystackPayment}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing with Paystack...
                                        </div>
                                    ) : (
                                        `Pay $${total.toFixed(2)} with Paystack`
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Bank Transfer Instructions */}
                        {paymentMethod === "transfer" && (
                            <div className="space-y-4 border-t pt-6">
                                <div className="p-4 bg-accent/10 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                                        <Banknote className="h-4 w-4" />
                                        <span>Bank Transfer Details</span>
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="font-medium">Bank Name:</Label>
                                                <p>First National Bank</p>
                                            </div>
                                            <div>
                                                <Label className="font-medium">Account Name:</Label>
                                                <p>Fashion Store Ltd</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="font-medium">Account Number:</Label>
                                                <p>123-456-789</p>
                                            </div>
                                            <div>
                                                <Label className="font-medium">Routing Number:</Label>
                                                <p>987654321</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Reference:</Label>
                                            <p>Order #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-background rounded border-l-4 border-accent">
                                        <p className="text-sm text-muted-foreground">
                                            Please include the reference number in your transfer description. Your order will be processed once
                                            payment is received (1-3 business days).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button className="w-full" disabled={!isFormValid || isProcessing} size="lg" type="submit" variant="luxury">
                            {isProcessing ? "Processing..." : paymentMethod === "card" ? `Pay $${total.toFixed(2)}` : "Confirm Order"}
                        </Button>

                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span>
                                {paymentMethod === "card"
                                    ? "Your payment information is secure and encrypted"
                                    : "Your order details are secure and protected"}
                            </span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentStep;
