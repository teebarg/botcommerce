"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { saveSubscription } from "./actions";

import { Button } from "@/components/ui/button";

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

const PushNotificationManager: React.FC = () => {
    const [isSupported, setIsSupported] = useState<boolean>(true);
    const [subscription, setSubscription] = useState<PushSubscription | any | null>(null);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
    const [show, setShow] = useState<boolean>(false);
    const [offline, setOffline] = useState<boolean>(false);

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (!reg) return;
                reg.addEventListener("updatefound", () => {
                    const newWorker = reg.installing;

                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                setWaitingWorker(newWorker);
                                setShow(true);
                            }
                        });
                    }
                });
            });
        }
        // Listen for online/offline events
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        // Only check if push is supported, don't register yet
        if ("serviceWorker" in navigator && "PushManager" in window) {
            registerServiceWorker();
            setIsSupported(true);
        }
    }, []);

    async function requestNotificationPermission() {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();

            return permission === "granted";
        }

        return false;
    }

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        });
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
            // Don't auto-subscribe, let user initiate
            setSubscription(null);
            handleNotificationOptIn();

            return;
        }

        setSubscription(sub);
    }

    // Add a new function to handle user opt-in
    async function handleNotificationOptIn() {
        if (!isSupported) {
            toast.error("Push notifications are not supported in your browser");

            return;
        }
        if (subscription) return;
        // await registerServiceWorker();
        await subscribeToPush();
    }

    async function subscribeToPush() {
        const permissionGranted = await requestNotificationPermission();

        if (!permissionGranted) {
            // toast.error("Please grant notification permission");

            return;
        }
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });

        // Send subscription to your backend
        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const res = await saveSubscription(subscriptionData);

        if (!res.success) {
            toast.error(res.message as string);

            return;
        }

        setSubscription(sub);
    }

    // async function unsubscribeFromPush() {
    //     await subscription?.unsubscribe();
    //     setSubscription(null);
    //     await unsubscribeUser();
    // }

    const handleRefresh = () => {
        waitingWorker?.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
    };

    if (!show && !offline) return null;

    return (
        <div className="fixed bottom-4 left-1/2 z-50 w-[95vw] max-w-sm -translate-x-1/2 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-gray-900 shadow-2xl border border-blue-200 p-5 flex flex-col items-center animate-fade-in">
            {offline ? (
                <>
                    <h2 className="text-lg font-bold mb-1">No Internet Connection</h2>
                    <p className="text-gray-700 text-sm mb-3 text-center">
                        You are currently offline. Some features may not work until you are back online.
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-lg font-bold mb-1">Update Available</h2>
                    <p className="text-gray-700 text-sm mb-3 text-center">
                        A new version of the app is available. Please refresh to get the latest features and fixes.
                    </p>
                    <Button className="mb-2 w-full" variant="emerald" onClick={handleRefresh}>
                        Refresh Now
                    </Button>
                </>
            )}
        </div>
    );
};

export { PushNotificationManager };
