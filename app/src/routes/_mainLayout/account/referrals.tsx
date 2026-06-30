import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { meQuery, meTxnsQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Copy, Gift, Share2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { currency } from "@/utils";
import { api } from "@/utils/api";
import { PaginatedWalletTxns, WalletTxn } from "@/schemas";
import { WalletTxnCard } from "@/components/store/account/WalletTxnCard";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";

export const Route = createFileRoute("/_mainLayout/account/referrals")({
    loader: async ({ context: { queryClient, userId } }) => {
        await Promise.all([queryClient.ensureQueryData(meQuery()), queryClient.ensureQueryData(meTxnsQuery(userId))]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = useRouteContext({ strict: false });
    const { data: me } = useSuspenseQuery(meQuery());
    const { data: initialTxns } = useSuspenseQuery(meTxnsQuery(userId!));
    const [copied, setCopied] = useState<boolean>(false);

    const {
        items: txns,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteResource<PaginatedWalletTxns, WalletTxn>({
        queryKey: ["wallet", userId?.toString(), "infinite"],
        queryFn: (cursor) =>
            api.get("/wallet/me", {
                params: { cursor },
            }),
        getItems: (page) => page.txns,
        getNextCursor: (page) => page.next_cursor,
        initialData: initialTxns,
    });

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
        <div className="space-y-6 px-2 pt-6 slide-in">
            <div
                className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 text-white"
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-5 h-5" />
                        <p className="text-sm font-medium opacity-90">Your Referral Code</p>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 bg-white/20 rounded-xl px-4 py-3 font-mono text-2xl font-bold tracking-widest text-center">
                            {me?.referral_code}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        onClick={handleShare}
                        className="w-full mt-4 py-3 rounded-xl bg-white/20 font-medium flex items-center justify-center gap-2 text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        Share with Friends
                    </button>

                    <p className="text-xs opacity-70 mt-3 text-center">Earn cashback when friends make their first purchase</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div
                    className="bg-card rounded-2xl p-4 text-center border border-border"
                >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-accent-subtle flex items-center justify-center mb-2">
                        <Wallet className="w-5 h-5 text-accent-subtle-foreground" />
                    </div>
                    <p className="text-xl font-bold">{currency(me.wallet_balance)}</p>
                    <p className="text-xs text-muted-foreground">Wallet Balance</p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Wallet Transactions</h3>
                    <span className="text-xs text-muted-foreground">{txns.length} transactions</span>
                </div>

                {!isLoading && txns.length > 0 && (
                    <InfiniteResourceList
                        items={txns}
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        isLoading={isFetchingNextPage}
                        renderItem={(txn, i) => <WalletTxnCard key={txn.id} txn={txn} index={i} />}
                    />
                )}
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-semibold mb-3">How It Works</h3>
                <div className="space-y-3">
                    {[
                        { step: "1", text: "Share your unique referral code with friends" },
                        { step: "2", text: "They get a discount on their first order" },
                        { step: "3", text: "You earn cashback to your wallet" },
                    ].map((item) => (
                        <div key={item.step} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {item.step}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
