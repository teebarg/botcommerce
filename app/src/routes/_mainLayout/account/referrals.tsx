import { createFileRoute } from "@tanstack/react-router";
import { meQuery, meTxnsQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowDownLeft, Check, Copy, Gift, Share2, ShoppingBag, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn, currency, formatDate } from "@/utils";

export const Route = createFileRoute("/_mainLayout/account/referrals")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(meQuery());
        await queryClient.ensureQueryData(meTxnsQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: me } = useSuspenseQuery(meQuery());
    const { data } = useSuspenseQuery(meTxnsQuery());
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(me?.referral_code!);
        setCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const shareData = {
            title: "Get cashback with my referral!",
            text: `Use my referral code ${me.referral_code} to get cashback on your first order!`,
            url: window.location.origin,
        };
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            handleCopy();
        }
    };

    return (
        <div className="space-y-6 px-2">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-white"
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-5 h-5" />
                        <p className="text-sm font-medium opacity-90">Your Referral Code</p>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 font-mono text-2xl font-bold tracking-widest text-center">
                            {me?.referral_code}
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCopy}
                            className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </motion.button>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleShare}
                        className="w-full mt-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm font-medium flex items-center justify-center gap-2 text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        Share with Friends
                    </motion.button>

                    <p className="text-xs opacity-70 mt-3 text-center">Earn cashback when friends make their first purchase</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
                <motion.div
                    key="Wallet Balance"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + 0 * 0.05 }}
                    className="bg-card rounded-2xl p-4 text-center border border-border"
                >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center mb-2 from-primary to-accent">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xl font-bold">{currency(me.wallet_balance)}</p>
                    <p className="text-xs text-muted-foreground">Wallet Balance</p>
                </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Wallet Transactions</h3>
                    <span className="text-xs text-muted-foreground">{data.txns.length} transactions</span>
                </div>
                <div className="space-y-2">
                    {data.txns.map((txn, i) => {
                        const isCredit = txn.type === "CASHBACK" || txn.type === "REVERSAL";
                        const TxnIcon = isCredit ? ArrowDownLeft : ShoppingBag;
                        return (
                            <motion.div
                                key={txn.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + i * 0.04 }}
                                className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3"
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
                                    <p className={cn("font-medium text-sm")}>{txn.type}</p>
                                    <p className="text-xs text-muted-foreground truncate">{txn.reference_code}</p>
                                    {txn.reference_id && <p className="text-xs text-muted-foreground truncate">({txn.reference_id})</p>}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={cn("font-semibold text-sm tabular-nums", isCredit ? "text-emerald-600" : "text-destructive")}>
                                        {isCredit ? "+" : ""}
                                        {currency(txn.amount)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{formatDate(txn.created_at)}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl p-5 border border-border"
            >
                <h3 className="font-semibold mb-3">How It Works</h3>
                <div className="space-y-3">
                    {[
                        { step: "1", text: "Share your unique referral code with friends" },
                        { step: "2", text: "They get a discount on their first order" },
                        { step: "3", text: "You earn cashback to your wallet" },
                    ].map((item) => (
                        <div key={item.step} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {item.step}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.text}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
