"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { paymentApi } from "@/apis/payment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                toast.error("Invalid payment reference");
                router.push("/orders");

                return;
            }

            try {
                const response = await paymentApi.verify(reference);

                if (response.data?.status === "success") {
                    toast.success(response.data.message);
                    router.push("/orders");
                } else {
                    toast.error(response.data?.message);
                    router.push("/orders");
                }
            } catch (error) {
                toast.error("Failed to verify payment");
                console.error(error);
                router.push("/orders");
            }
        };

        verifyPayment();
    }, [reference, router]);

    return (
        <div className="container mx-auto flex min-h-[50vh] items-center justify-center">
            <Card className="w-full max-w-md p-6">
                <div className="space-y-4 text-center">
                    <h1 className="text-2xl font-bold">Verifying Payment</h1>
                    <p className="text-muted-foreground">Please wait while we verify your payment...</p>
                    <Button variant="outline" onClick={() => router.push("/orders")}>
                        Return to Orders
                    </Button>
                </div>
            </Card>
        </div>
    );
}
