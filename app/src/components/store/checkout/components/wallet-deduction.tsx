import { cn, currency } from "@/utils";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { meQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

const WalletDeduction: React.FC = () => {
    const { data: me } = useSuspenseQuery(meQuery());
    const [useWalletCredit, setUseWalletCredit] = useState(false);
    const walletBalance = 0;
    const walletDiscount = useWalletCredit ? walletBalance : 0;

    const onToggleWalletCredit = (checked: boolean) => {
        setUseWalletCredit(checked);
    };
    return (
        <>
            {/* Wallet Credit */}
            {me.wallet_balance! > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300",
                        useWalletCredit ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    useWalletCredit ? "gradient-primary" : "bg-secondary"
                                )}
                            >
                                <Wallet className={cn("w-5 h-5", useWalletCredit ? "text-white" : "text-primary")} />
                            </div>
                            <div>
                                <Label className="font-semibold">Referral Credit</Label>
                                <p className="text-xs text-muted-foreground">
                                    Available balance: <span className="font-semibold text-primary">{currency(me.wallet_balance!)}</span>
                                </p>
                            </div>
                        </div>
                        <Switch checked={useWalletCredit} onCheckedChange={(checked) => onToggleWalletCredit?.(checked)} />
                    </div>

                    <AnimatePresence>
                        {useWalletCredit && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Credit applied</span>
                                    <span className="font-bold text-primary">-{currency(me.wallet_balance!)}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Full wallet balance will be applied. Remaining amount charged to your payment method.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </>
    );
};

export default WalletDeduction;
