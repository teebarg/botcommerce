import { Banknote, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { useBankDetails } from "@/hooks/useApi";
import { useCompleteCart } from "@/hooks/useCart";
import { Label } from "@/components/ui/label";

interface BankTransferProps {
    amount: number;
    canContinue: boolean;
    onSuccess?: () => void;
}

const BankTransfer: React.FC<BankTransferProps> = ({ amount, canContinue }) => {
    const completeCart = useCompleteCart();

    const { data: bankDetails } = useBankDetails();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "PENDING",
            status: "PENDING",
        });
    };

    return (
        <>
            <div className="px-4">
                <div className="rounded-xl border border-border bg-card p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Bank transfer details</h4>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bank name</span>
                            <span className="font-medium">{bankDetails?.[0]?.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account name</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account number</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_number}</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Include the order number in your transfer description. Your order will be processed once payment is received (1–3 business days).
                        </p>
                    </div>
                </div>
            </div>
            <div className="checkout-footer">
                <Button
                    disabled={completeCart.isPending || !canContinue}
                    isLoading={completeCart.isPending}
                    onClick={onPaymentCompleted}
                    size="lg"
                    className="rounded-full text-sm font-semibold w-full md:w-auto md:px-10"
                >
                    Pay {currency(amount)} via Bank Transfer
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
};

export default BankTransfer;
