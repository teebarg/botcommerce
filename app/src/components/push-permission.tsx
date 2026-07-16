import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/utils/try-catch";
import { Bell, Package, Tag, Truck } from "lucide-react";
import { cn } from "@/utils/cn";
import { api } from "@/utils/api";
import { Message } from "@/schemas";
import { track } from "@/lib/analytics";

const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;
const INITIAL_DELAY_DURATION = 20 * 1000;

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

const BENEFITS = [
    {
        icon: Package,
        title: "New bales",
        detail: "First pick before a fresh bale sells out",
    },
    {
        icon: Tag,
        title: "Price drops",
        detail: "Get the alert the moment prices come down",
    },
    {
        icon: Truck,
        title: "Order updates",
        detail: "Real-time status from checkout to delivery",
    },
] as const;

export default function PushPermission() {
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
    const [isDelayPassed, setIsDelayPassed] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsMounted(true);

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

        let sessionStart = sessionStorage.getItem("push_session_start");
        if (!sessionStart) {
            sessionStart = Date.now().toString();
            sessionStorage.setItem("push_session_start", sessionStart);
        }

        const timeElapsed = Date.now() - Number(sessionStart);
        const timeRemaining = INITIAL_DELAY_DURATION - timeElapsed;

        if (timeRemaining <= 0) {
            setIsDelayPassed(true);
        } else {
            timerRef.current = setTimeout(() => {
                setIsDelayPassed(true);
            }, timeRemaining);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const syncSubscriptionToBackend = useCallback(async (sub: PushSubscription) => {
        if (isSyncing) return false;
        setIsSyncing(true);
        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(api.post<Message>("/notification/push-fcm", subscriptionData));

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
    }, [isSyncing]);

    const checkSubscription = useCallback(async () => {
        if (isChecking) return;
        setIsChecking(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();

            if (!sub) {
                return;
            }
            if (hasSubscriptionChanged(sub) || !localStorage.getItem("push_synced")) {
                await syncSubscriptionToBackend(sub);
            } else {
                setSubscription(sub);
            }
        } catch (err) {
            console.error("Subscription check failed", err);
        } finally {
            setIsChecking(false);
        }
    }, [isChecking, syncSubscriptionToBackend]);

    async function subscribeToPush() {
        setIsSubscribing(true);
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            track(perm === "granted" ? "push_permission_granted" : "push_permission_denied");

            if (perm !== "granted") return;

            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                // @ts-expect-error -- Suppress TS2322 for BufferSource mismatch
                applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY!),
            });

            const synced = await syncSubscriptionToBackend(sub);
            if (!synced) {
                track("push_sync_failed");
                // syncSubscriptionToBackend already surfaced a toast
                return;
            }
            track("push_subscribed");
        } catch (err) {
            track("push_subscribe_failed", { message: err instanceof Error ? err.message : String(err) });
            toast.error("Couldn't turn on notifications. Please try again.");
        } finally {
            setIsSubscribing(false);
        }
    }

    useEffect(() => {
        if (!isMounted) return;

        if (permission === "granted") {
            checkSubscription();
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
    }, [isMounted, permission, checkSubscription]);

    async function handleOptIn() {
        track("push_cta_clicked");

        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            track("push_unsupported_browser");
            toast.error("Notifications aren't supported in this browser.");
            return;
        }
        if (subscription || isSubscribing) return;

        if (permission === "denied") {
            track("push_already_blocked");
            toast.error("Notifications are blocked. Enable them in your browser settings.", { duration: 5000 });
            return;
        }

        await subscribeToPush();
    }

    function handleDismiss() {
        track("push_dismissed_not_now");
        localStorage.setItem("push_dismissed_until", (Date.now() + DISMISS_DURATION).toString());
        setIsDismissed(true);
    }

    function handleClose() {
        track("push_dismissed_backdrop");
        setIsDismissed(true);
    }

    const isVisible = isMounted && !isDismissed && permission !== "granted" && isDelayPassed;

    useEffect(() => {
        if (isVisible) track("push_prompt_shown");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            key="push-permission-overlay"
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-300"
        >
            <div onClick={handleClose} className="absolute inset-0 bg-black/60" />
            <div
                className={cn(
                    "relative w-full md:max-w-sm shadow-2xl border border-border/50",
                    "bg-card rounded-t-[28px] md:rounded-3xl overflow-hidden pb-[var(--sab)]",
                    "animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-300 ease-out"
                )}
            >
                <div className="pt-7 pb-5 px-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15">
                            <Bell className="w-6 h-6 text-accent" strokeWidth={2} />
                            <div className="absolute -inset-1 rounded-2xl border border-accent/30" />
                        </div>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                        Notifications
                    </p>
                    <h2 className="text-lg font-semibold leading-snug">
                        Be first to know when a new bale drops
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
                        Turn on notifications so you don&apos;t miss the good pieces before they&apos;re gone.
                    </p>
                </div>

                <div className="divide-y divide-border border-y border-border">
                    {BENEFITS.map(({ icon: Icon, title, detail }) => (
                        <div key={title} className="flex items-start gap-3 px-6 py-3.5">
                            <Icon className="w-[18px] h-[18px] text-accent mt-0.5 shrink-0" strokeWidth={2} />
                            <div>
                                <p className="text-sm font-medium">{title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 pt-4 pb-2">
                    <button
                        type="button"
                        onClick={handleOptIn}
                        disabled={isSubscribing}
                        className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 active:bg-accent/80 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {isSubscribing ? "Turning on…" : "Turn on notifications"}
                    </button>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="w-full py-3 text-center font-medium text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}