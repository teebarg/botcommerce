import { ArrowDownLeft, ShoppingBag } from "lucide-react";
import { cn, currency, formatDate } from "@/utils";
import { WalletTxn } from "@/schemas";

interface Props {
    txn: WalletTxn;
    index: number;
}

export function WalletTxnCard({ txn, index }: Props) {
    const isCredit = txn.type === "CASHBACK" || txn.type === "REVERSAL";

    const TxnIcon = isCredit ? ArrowDownLeft : ShoppingBag;

    return (
        <div
            className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300"
            style={{ animationDelay: `${250 + index * 40}ms` }}
        >
            <div
                className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isCredit ? "bg-emerald-100 text-emerald-800" : "bg-destructive/10 text-destructive"
                )}
            >
                <TxnIcon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{txn.type}</p>
                <p className="text-xs text-muted-foreground truncate">{txn.reference_code}</p>
                {/* {txn.reference_id && <p className="text-xs text-muted-foreground truncate">({txn.reference_id})</p>} */}
            </div>

            <div className="text-right shrink-0">
                <p className={cn("font-semibold text-sm tabular-nums", isCredit ? "text-emerald-600" : "text-destructive")}>
                    {isCredit ? "+" : ""}
                    {currency(txn.amount)}
                </p>
                <p className="text-xxs text-muted-foreground">{formatDate(txn.created_at)}</p>
            </div>
        </div>
    );
}
