"use client";

import { Button } from "@/components/ui/button";
import { currency } from "@/lib/utils";
import { useBankDetails } from "@/lib/hooks/useApi";
import { useCompleteCart } from "@/lib/hooks/useCart";

interface BankTransferProps {
    amount: number;
    onSuccess?: () => void;
}

const BankTransfer: React.FC<BankTransferProps> = ({ amount }) => {
    const completeCart = useCompleteCart();

    const { data: bankDetails } = useBankDetails();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "SUCCESS",
            status: "PAID",
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-content1 p-4 rounded-lg space-y-3">
                <div>
                    <p className="text-sm font-medium text-default-500">Bank Name</p>
                    <p className="text-sm text-default-900">{bankDetails?.[0]?.bank_name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-default-500">Account Number</p>
                    <p className="text-sm text-default-900">{bankDetails?.[0]?.account_number}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-default-500">Account Name</p>
                    <p className="text-sm text-default-900">{bankDetails?.[0]?.account_name}</p>
                </div>
                <p className="text-xs text-default-500 mt-2">Please use your order number as reference when making the transfer.</p>
            </div>

            <Button
                className="w-full"
                disabled={completeCart.isPending}
                isLoading={completeCart.isPending}
                size="lg"
                variant="primary"
                onClick={onPaymentCompleted}
            >
                Pay {currency(amount)} via Bank Transfer
            </Button>
            <div className="mt-4 flex items-center justify-center text-xs text-default-500">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    />
                </svg>
                Secure 256-bit SSL encrypted payment
            </div>
        </div>
    );
};

export default BankTransfer;
