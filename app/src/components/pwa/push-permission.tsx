import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/utils/try-catch";
import { sendFCMFn } from "@/server/generic.server";
import { Gift, Sparkles, Star } from "lucide-react";
import { cn, currency } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";

const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
        // Add padding to make length a multiple of 4
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

        // Decode the base64 string
        const rawData = window.atob(base64);

        // Convert binary string to Uint8Array
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    } catch (error) {
        throw new Error(`Error decoding Base64 string - ${error}`);
    }
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
    const [permission, setPermission] = useState("granted");
    const [subscription, setSubscription] = useState<PushSubscription | any | null>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(false);

    useEffect(() => {
        const dismissedAt = localStorage.getItem("push_dismissed_at");
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt, 10);
            const now = Date.now();

            if (now - dismissedTime < DISMISS_DURATION) {
                setIsDismissed(true);
            } else {
                localStorage.removeItem("push_dismissed_at");
                setIsDismissed(false);
            }
        }

        if (localStorage.getItem("push_synced") === "true") {
            setIsDismissed(true);
        }

        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }

        if (permission === "granted" && localStorage.getItem("push_synced") !== "true") {
            setIsDismissed(true);
            registerServiceWorker();
        }
    }, [permission]);

    useEffect(() => {
        if (permission !== "granted") return;

        const checkSubscriptionChanges = async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                const sub = await registration.pushManager.getSubscription();

                if (sub && hasSubscriptionChanged(sub)) {
                    console.log("Subscription changed, syncing with backend...");
                    await syncSubscriptionToBackend(sub);
                }
            } catch (error) {
                console.error("Error checking subscription:", error);
            }
        };

        checkSubscriptionChanges();
        const intervalId = setInterval(checkSubscriptionChanges, CHECK_INTERVAL);

        return () => clearInterval(intervalId);
    }, [permission]);

    async function syncSubscriptionToBackend(sub: PushSubscription) {
        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(sendFCMFn({ data: subscriptionData }));

        if (error) {
            toast.error(error);
            return false;
        }

        storeSubscriptionKeys(sub);
        setSubscription(sub);
        localStorage.setItem("push_synced", "true");
        return true;
    }

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
            setIsDismissed(false);
            return;
        }

        if (hasSubscriptionChanged(sub)) {
            await syncSubscriptionToBackend(sub);
        } else {
            setSubscription(sub);
        }
    }

    async function handleNotificationOptIn() {
        if (!("serviceWorker" in navigator)) throw new Error("SW not supported");
        if (!("PushManager" in window)) throw new Error("Push not supported");
        if (subscription) return;
        if (permission === "denied") {
            toast.error("You blocked notifications. Please re-enable in browser settings.", {
                duration: 5000,
            });
            return;
        }
        await subscribeToPush();
    }

    async function subscribeToPush() {
        const perm = await Notification.requestPermission();

        setPermission(perm);

        if (perm !== "granted") return null;
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            // @ts-expect-error -- Suppress TS2322 for BufferSource mismatch
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY!),
        });

        if (!sub) {
            toast.error("You blocked notifications. Please re-enable in browser settings.", {
                duration: 5000,
            });
            return;
        }

        await syncSubscriptionToBackend(sub);
    }

    function handleDismiss() {
        setIsDismissed(true);
        localStorage.setItem("push_dismissed_at", Date.now().toString());
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
                        "bg-card rounded-t-[28px] md:rounded-3xl overflow-hidden"
                    )}
                >
                    <div key="permission">
                        <div className="pt-8 pb-4 px-6 text-center">
                            <div className="relative gradient-success py-8 px-6">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                                <div className="relative flex justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gold/30 rounded-2xl blur-xl animate-pulse-glow" />
                                        <div className="relative bg-card p-5 rounded-2xl shadow-glow animate-gift-open">
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
                                    <span className="text-5xl font-extrabold text-gradient-gold">{currency(50000)}</span>
                                </div>
                                <p className="text-sm font-medium text-primary mt-2">Shopping Credits</p>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="border-t border-border">
                            <button
                                onClick={handleDismiss}
                                className="w-full py-4 text-center font-medium text-muted-foreground hover:bg-secondary/50 active:bg-secondary transition-colors border-b border-border"
                            >
                                Maybe later
                            </button>
                            <button
                                onClick={handleNotificationOptIn}
                                className="w-full py-4 text-center font-semibold text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors"
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
