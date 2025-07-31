import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Lock, ShoppingBag, Banknote } from "lucide-react";

interface PaymentStepProps {
    deliveryType: "shipping" | "pickup";
    onPaymentSubmitted: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ deliveryType, onPaymentSubmitted }) => {
    const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        nameOnCard: "",
    });
    const [isProcessing, setIsProcessing] = useState(false);

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

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-subtle">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <Card className="shadow-elegant animate-fade-in">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
                            <CreditCard className="h-6 w-6 text-accent" />
                            <span>Payment Details</span>
                        </CardTitle>
                        <CardDescription>Choose your payment method and complete your order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Payment Method Selection */}
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Payment Method</Label>
                                <RadioGroup value={paymentMethod} onValueChange={(value: "card" | "transfer") => setPaymentMethod(value)}>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/10 transition-colors">
                                        <RadioGroupItem value="card" id="card" />
                                        <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                                            <CreditCard className="h-4 w-4" />
                                            <span>Credit/Debit Card</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/10 transition-colors">
                                        <RadioGroupItem value="transfer" id="transfer" />
                                        <Label htmlFor="transfer" className="flex items-center space-x-2 cursor-pointer flex-1">
                                            <Banknote className="h-4 w-4" />
                                            <span>Bank Transfer</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Card Payment Form */}
                            {paymentMethod === "card" && (
                                <div className="space-y-6 border-t pt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nameOnCard">Name on Card *</Label>
                                        <Input
                                            id="nameOnCard"
                                            placeholder="John Doe"
                                            value={paymentForm.nameOnCard}
                                            onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber">Card Number *</Label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                className="pl-10"
                                                value={paymentForm.cardNumber}
                                                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiryMonth">Month *</Label>
                                            <Select
                                                value={paymentForm.expiryMonth}
                                                onValueChange={(value) => handleInputChange("expiryMonth", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="MM" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                        <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                                                            {month.toString().padStart(2, "0")}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expiryYear">Year *</Label>
                                            <Select value={paymentForm.expiryYear} onValueChange={(value) => handleInputChange("expiryYear", value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="YYYY" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV *</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="cvv"
                                                    placeholder="123"
                                                    className="pl-10"
                                                    maxLength={4}
                                                    value={paymentForm.cvv}
                                                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
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

                            <Button type="submit" disabled={!isFormValid || isProcessing} variant="luxury" size="lg" className="w-full">
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
        </div>
    );
};

export default PaymentStep;
