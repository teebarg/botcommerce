import { Banknote, Copy, Check } from "lucide-react";
import { useBankDetails } from "@/hooks/useApi";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface Props {
    order_number?: string;
}

type CopyField = "account_number" | "order_number";

const BankDetails: React.FC<Props> = ({ order_number }) => {
    const { data: bankDetails } = useBankDetails();
    const [copiedField, setCopiedField] = useState<CopyField | null>(null);

    const handleCopy = async (field: CopyField, value?: string) => {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 2000);
        } catch {
            // Clipboard API can fail on non-HTTPS or if permission is denied
        }
    };

    return (
        <div className="rounded-xl bg-card p-4 mt-4">
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
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Account number</span>
                    <button
                        type="button"
                        onClick={() => handleCopy("account_number", bankDetails?.[0]?.account_number)}
                        className={cn(
                            "flex items-center gap-1.5 font-medium rounded-md px-2 py-1 -mr-2 transition-colors",
                            "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            copiedField === "account_number" && "text-success"
                        )}
                    >
                        {bankDetails?.[0]?.account_number}
                        {copiedField === "account_number" ? (
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </button>
                </div>
                {order_number && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Reference</span>
                        <button
                            type="button"
                            onClick={() => handleCopy("order_number", order_number)}
                            className={cn(
                                "flex items-center gap-1.5 font-medium rounded-md px-2 py-1 -mr-2 transition-colors",
                                "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                copiedField === "order_number" && "text-success"
                            )}
                        >
                            {order_number}
                            {copiedField === "order_number" ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                            ) : (
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {order_number && ("Paste the order number above into your transfer description.")} Your order will be processed once payment is received.
                </p>
            </div>
        </div>
    );
};

export default BankDetails;