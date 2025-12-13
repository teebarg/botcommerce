import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/utils/try-catch";
import { Button } from "@/components/ui/button";
import { sendFCMFn } from "@/server/generic.server";
import { Gift, Sparkles, X, Check, Star } from "lucide-react";
import { currency } from "@/utils";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 animate-slide-up">
            <div className="absolute inset-0 bg-foreground/10 backdrop-blur-sm" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-gold opacity-60"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.2}s`,
                            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                        }}
                    />
                ))}
            </div>
            <div className="relative w-full max-w-md bg-card rounded-3xl shadow-card overflow-hidden transition-all duration-500 animate-scale-in">
                <button onClick={handleDismiss} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>

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
                <div className="px-6 py-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground">
                            <Gift className="w-4 h-4 text-gold" />
                            <span className="text-sm font-semibold">Surprise Gift</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-extrabold text-foreground mb-2">You Have a Gift! 🎁</h2>
                    <p className="text-muted-foreground mb-6">We have something special waiting just for you</p>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 gradient-gold opacity-20 blur-2xl rounded-3xl" />
                        <div className="relative bg-muted rounded-2xl p-6 border-2 border-gold/30">
                            <p className="text-sm text-muted-foreground mb-2">Your gift is worth</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-5xl font-extrabold text-gradient-gold">{currency(50000)}</span>
                            </div>
                            <p className="text-sm font-medium text-primary mt-2">Shopping Credits</p>
                        </div>
                    </div>
                    <div className="space-y-3 mb-8">
                        {["Be the first to know about flash sales", "Get exclusive VIP discounts", "Never miss your order updates"].map(
                            (benefit, index) => (
                                <div key={index} className="flex items-center gap-3 text-left" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm text-foreground">{benefit}</span>
                                </div>
                            )
                        )}
                    </div>
                    <div className="space-y-3">
                        <Button variant="reward" size="xl" className="w-full" onClick={handleNotificationOptIn}>
                            <Gift className="w-5 h-5" />
                            Claim My Gift!
                        </Button>
                        <button onClick={handleDismiss} className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Maybe later
                        </button>
                    </div>
                    <p className="mt-6 text-xs text-muted-foreground">🔒 We respect your privacy. Unsubscribe anytime.</p>
                </div>
            </div>
        </div>
    );
}
