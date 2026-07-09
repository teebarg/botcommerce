import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { useCompleteCart } from "@/hooks/useCart";
import BankDetails from "../checkout/components/bank-details";

interface BankTransferProps {
    amount: number;
    canContinue: boolean;
    onSuccess?: () => void;
}

const BankTransfer: React.FC<BankTransferProps> = ({ amount, canContinue }) => {
    const completeCart = useCompleteCart();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "PENDING",
            status: "PENDING",
        });
    };

    return (
        <>
            <div className="mx-4">
                <BankDetails />
            </div>
            <div className="checkout-footer">
                <Button
                    disabled={completeCart.isPending || !canContinue}
                    isLoading={completeCart.isPending}
                    onClick={onPaymentCompleted}
                    size="lg"
                    className="rounded-full text-md font-semibold w-full md:w-auto md:px-10"
                >
                    Pay {currency(amount)} via Bank Transfer
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
};

export default BankTransfer;
