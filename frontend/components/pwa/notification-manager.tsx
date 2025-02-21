"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

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

function PushNotificationManager() {
    const { enqueueSnackbar } = useSnackbar();
    const [isSupported, setIsSupported] = useState<boolean>(true);
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
            handleNotificationOptIn();

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
        if (subscription) return;
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
        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const res = await saveSubscription(subscriptionData);

        if (!res.success) {
            enqueueSnackbar(res.message as string, { variant: "error" });

            return;
        }

        setSubscription(sub);
    }

    // async function unsubscribeFromPush() {
    //     await subscription?.unsubscribe();
    //     setSubscription(null);
    //     await unsubscribeUser();
    // }

    function handleReload() {
        window.location.reload();
    }

    return (
        <div>
            {newContent && (
                <Button aria-label="reload page" className="w-full" color="primary" onClick={handleReload}>
                    New content available
                </Button>
            )}
        </div>
    );
}

export { PushNotificationManager };
