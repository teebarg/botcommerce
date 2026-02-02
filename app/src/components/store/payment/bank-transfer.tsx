import { Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { useBankDetails } from "@/hooks/useApi";
import { useCompleteCart } from "@/hooks/useCart";
import { Label } from "@/components/ui/label";

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
        <>
            <div className="px-4">
                <div className="p-4 bg-contrast/10 rounded-lg mt-4">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Banknote className="h-4 w-4" />
                        <span>Bank Transfer Details</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="font-medium">Bank Name:</Label>
                                <p>{bankDetails?.[0]?.bank_name}</p>
                            </div>
                            <div>
                                <Label className="font-medium">Account Name:</Label>
                                <p>{bankDetails?.[0]?.account_name}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="font-medium">Account Number:</Label>
                                <p>{bankDetails?.[0]?.account_number}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 p-3 bg-background rounded border-l-4 border-contrast">
                        <p className="text-sm text-muted-foreground">
                            Please include the order number in your transfer description. Your order will be processed once payment is received (1-3
                            business days).
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end py-2 sticky px-4 bottom-0 border-t md:border-t-0 bg-background mt-4">
                <Button
                    disabled={completeCart.isPending}
                    isLoading={completeCart.isPending}
                    onClick={onPaymentCompleted}
                    size="lg"
                    className="bg-gradient-action shadow-glow hover:opacity-90 transition-opacity h-14 rounded-2xl text-base font-semibold w-full md:w-sm"
                >
                    Pay {currency(amount)} via Bank Transfer
                </Button>
            </div>
        </>
    );
};

export default BankTransfer;
