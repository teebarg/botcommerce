import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/utils/try-catch";
import { Gift, Sparkles, Star } from "lucide-react";
import { cn, currency } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import { clientApi } from "@/utils/api.client";
import { Message } from "@/schemas";

const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function getDismissState(): boolean {
    const dismissedUntil = localStorage.getItem("push_dismissed_until");

    if (!dismissedUntil) return false;

    if (Date.now() > Number(dismissedUntil)) {
        localStorage.removeItem("push_dismissed_until");
        return false;
    }

    return true;
}

function getStoredSubscriptionKeys() {
    const stored = localStorage.getItem("push_subscription_keys");
    return stored ? JSON.parse(stored) : null;
}

function hasSubscriptionChanged(currentSub: PushSubscription) {
    const stored = getStoredSubscriptionKeys();
    if (!stored) return true;

    const current = {
        endpoint: currentSub.endpoint,
        p256dh: currentSub.toJSON().keys?.p256dh || "",
        auth: currentSub.toJSON().keys?.auth || "",
    };

    return stored.endpoint !== current.endpoint || stored.p256dh !== current.p256dh || stored.auth !== current.auth;
}

function storeSubscriptionKeys(sub: PushSubscription) {
    const subscriptionData = {
        endpoint: sub.endpoint,
        p256dh: sub.toJSON().keys?.p256dh || "",
        auth: sub.toJSON().keys?.auth || "",
    };
    localStorage.setItem("push_subscription_keys", JSON.stringify(subscriptionData));
}

export default function PushPermission() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if ("Notification" in window) {
            setPermission(Notification.permission);
        }

        if (localStorage.getItem("push_synced") === "true") {
            setIsDismissed(true);
            return;
        }

        if (getDismissState()) {
            setIsDismissed(true);
            return;
        }
        setIsDismissed(false);
    }, []);

    const syncSubscriptionToBackend = useCallback(async (sub: PushSubscription) => {
        if (isSyncing) return;
        setIsSyncing(true);
        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(clientApi.post<Message>("/notification/push-fcm", subscriptionData));

        if (error) {
            toast.error(error);
            setIsSyncing(false);
            return false;
        }

        storeSubscriptionKeys(sub);
        setSubscription(sub);
        localStorage.setItem("push_synced", "true");
        setIsSyncing(false);
        return true;
    }, []);

    const checkSubscription = async () => {
        if (isChecking) return;
        setIsChecking(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();

            if (!sub) {
                subscribeToPush();
                return;
            }
            if (hasSubscriptionChanged(sub) || !localStorage.getItem("push_synced")) {
                console.debug("Subscription changed, syncing to backend");
                await syncSubscriptionToBackend(sub);
            } else {
                setSubscription(sub);
            }
        } catch (err) {
            console.error("Subscription check failed", err);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        if (permission !== "granted") {
            void (async () => {
                await subscribeToPush();
            })();
        }
        const onVisible = () => {
            if (document.visibilityState === "visible") {
                checkSubscription();
            }
        };

        const onPushSubscriptionChange = () => {
            checkSubscription();
        };

        document.addEventListener("visibilitychange", onVisible);
        document.addEventListener("pushsubscriptionchange", onPushSubscriptionChange);
        return () => {
            document.removeEventListener("visibilitychange", onVisible);
            document.removeEventListener("pushsubscriptionchange", onPushSubscriptionChange);
        };
    }, []);

    async function subscribeToPush() {
        const perm = await Notification.requestPermission();

        setPermission(perm);

        if (perm !== "granted") return;
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            // @ts-expect-error -- Suppress TS2322 for BufferSource mismatch
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY!),
        });

        if (!sub) {
            toast.error("You blocked notifications. Please re-enable in browser settings.");
            return;
        }

        await syncSubscriptionToBackend(sub);
    }

    async function handleOptIn() {
        if (!("serviceWorker" in navigator)) throw new Error("Service worker not supported");

        if (!("PushManager" in window)) throw new Error("Push not supported");

        if (subscription) return;

        if (permission === "denied") {
            toast.error("You blocked notifications. Please re-enable in browser settings.", { duration: 5000 });
            return;
        }

        await subscribeToPush();
    }

    function handleDismiss() {
        localStorage.setItem("push_dismissed_until", (Date.now() + DISMISS_DURATION).toString());
        setIsDismissed(true);
    }

    if (isDismissed || permission === "granted") return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={cn(
                        "relative w-full md:max-w-sm shadow-2xl border border-border/50",
                        "bg-card rounded-t-[28px] md:rounded-3xl overflow-hidden pb-[var(--sab)]"
                    )}
                >
                    <div key="permission">
                        <div className="pt-8 pb-4 px-6 text-center">
                            <div className="relative py-8 px-6">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                                <div className="relative flex justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gold/30 rounded-2xl blur-xl animate-pulse-glow" />
                                        <div className="relative bg-card p-5 rounded-2xl shadow-glow">
                                            <Gift className="w-12 h-12 text-primary" strokeWidth={2} />
                                        </div>
                                        <div className="absolute -top-2 -left-2 animate-sparkle-burst" style={{ animationDelay: "0s" }}>
                                            <Star className="w-4 h-4 text-gold fill-gold" />
                                        </div>
                                        <div className="absolute -top-1 -right-2 animate-sparkle-burst" style={{ animationDelay: "0.5s" }}>
                                            <Star className="w-3 h-3 text-gold fill-gold" />
                                        </div>
                                        <div className="absolute -bottom-1 -left-1 animate-sparkle-burst" style={{ animationDelay: "1s" }}>
                                            <Star className="w-3 h-3 text-gold fill-gold" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-1 animate-sparkle-burst" style={{ animationDelay: "0.75s" }}>
                                            <Sparkles className="w-4 h-4 text-accent" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-lg font-semibold mb-2"
                            >
                                You Have a Gift! 🎁
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-sm text-muted-foreground leading-relaxed"
                            >
                                We have something special waiting just for you
                            </motion.p>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <div className="relative bg-muted rounded-2xl p-6 border-2 border-gold/30 text-center mb-6 mx-6">
                                <p className="text-sm text-muted-foreground mb-2">Your gift is worth</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-5xl font-extrabold text-gold">{currency(50000)}</span>
                                </div>
                                <p className="text-sm font-medium text-primary mt-2">Shopping Credits</p>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="border-t border-border">
                            <button
                                onClick={handleDismiss}
                                className="w-full py-4 text-center font-medium text-muted-foreground hover:bg-secondary/50 active:bg-secondary transition-colors border-b border-border cursor-pointer"
                            >
                                Maybe later
                            </button>
                            <button
                                onClick={handleOptIn}
                                className="w-full py-4 text-center font-semibold text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer"
                            >
                                Claim My Gift!
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
