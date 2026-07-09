import { cn, currency } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMemo } from "react";
import { meQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useApplyWalletCredit, useRemoveWalletCredit } from "@/hooks/useCart";
import { Cart } from "@/schemas";

const WalletDeduction: React.FC<{ cart: Cart }> = ({ cart }) => {
    const { data: me } = useSuspenseQuery(meQuery());
    const useWalletCredit = useMemo(() => cart.wallet_used > 0, [cart.wallet_used]);
    const applyWalletCredit = useApplyWalletCredit();
    const removeWalletCredit = useRemoveWalletCredit();

    const onToggleWalletCredit = (checked: boolean) => {
        if (checked) {
            applyWalletCredit.mutate();
        } else {
            removeWalletCredit.mutate();
        }
    };
    if (me.wallet_balance <= 0 && cart.wallet_used <= 0) {
        return null;
    }
    return (
        <div className={cn("p-3 rounded-xl", useWalletCredit ? "bg-accent/10" : "bg-card")}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wallet className={cn("w-6 h-6", useWalletCredit ? "text-accent" : "")} />
                    <div>
                        <Label className="font-semibold">Referral Credit</Label>
                        <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">{currency(me.wallet_balance)}</span> available
                        </p>
                    </div>
                </div>
                <Switch checked={useWalletCredit} onCheckedChange={(checked) => onToggleWalletCredit?.(checked)} />
            </div>
            <AnimatePresence>
                {cart.wallet_used > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Credit applied</span>
                            <span className="font-bold text-primary">-{currency(cart.wallet_used)}</span>
                        </div>
                        <p className="text-2xs text-muted-foreground mt-1">
                            Full wallet balance will be applied. Remaining amount charged to your payment method.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletDeduction;
