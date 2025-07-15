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
            payment_status: "PENDING",
            status: "PENDING",
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
            <div className="mt-4 text-center text-xs text-default-500">
                <p className="text-xs text-default-500 mt-2">Please use your order number as reference when making the transfer.</p>
            </div>
        </div>
    );
};

export default BankTransfer;
