"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Bell, CancelIcon } from "nui-react-icons";

import { subscribeUser, unsubscribeUser } from "./actions";

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

function PushNotificationManager() {
    const { enqueueSnackbar } = useSnackbar();
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [newContent, setNewContent] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<PushSubscription | any | null>(null);

    useEffect(() => {
        const broadcast = new BroadcastChannel("sw-messages");

        broadcast.addEventListener("message", (event) => {
            if (event.data.type === "NEW_CONTENT_AVAILABLE") {
                console.log("Show new content banner");
                setNewContent(true);
            }
        });

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

            return;
        }

        setSubscription(sub);
    }

    // Add a new function to handle user opt-in
    async function handleNotificationOptIn() {
        if (!isSupported) {
            enqueueSnackbar("Push notifications are not supported in your browser", { variant: "error" });

            return;
        }

        // await registerServiceWorker();
        await subscribeToPush();
    }

    async function subscribeToPush() {
        const permissionGranted = await requestNotificationPermission();

        if (!permissionGranted) {
            enqueueSnackbar("Notification permission not granted", { variant: "error" });

            return;
        }
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });

        // Send subscription to your backend
        const res = await subscribeUser(sub);

        if (!res.success) {
            enqueueSnackbar(res.message as string, { variant: "error" });

            return;
        }

        setSubscription(sub);
    }

    async function unsubscribeFromPush() {
        await subscription?.unsubscribe();
        setSubscription(null);
        await unsubscribeUser();
    }

    function handleReload() {
        window.location.reload();
    }

    return (
        <div>
            {/* Add notification opt-in button */}
            {isSupported && !subscription && (
                <div className="fixed top-4 left-4 right-4 md:right-auto md:max-w-[25rem] z-50">
                    <div className="bg-content2 rounded-lg shadow-xl p-8">
                        {/* Close button */}
                        <button className="absolute top-2 right-2 text-default-500 hover:text-default-500/5" onClick={() => setIsSupported(false)}>
                            <CancelIcon className="h-6 w-6" />
                        </button>

                        {/* Icon and content container */}
                        <div className="flex items-start space-x-4">
                            <div className="bg-secondary p-3 rounded-full">
                                <Bell className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-default-900 mb-1">Stay Updated</h3>
                                <p className="text-sm text-default-500 mb-3">
                                    Get instant updates about your orders, exclusive deals, and special offers
                                </p>

                                {/* Enable button */}
                                <Button color="secondary" startContent={<Bell size={20} />} onClick={handleNotificationOptIn}>
                                    <span>Enable Notifications</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {newContent && (
                <Button aria-label="reload page" className="w-full" color="primary" onClick={handleReload}>
                    New content available
                </Button>
            )}
        </div>
    );
}

export { PushNotificationManager };
