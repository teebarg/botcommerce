"use client";

import { useState, useEffect } from "react";
import { Bell } from "nui-react-icons";
import { useSnackbar } from "notistack";

import { subscribeUser, unsubscribeUser } from "./actions";

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

        setSubscription(sub);
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

    if (!isSupported) {
        return <></>;
    }

    return (
        <div>
            {newContent && (
                <button
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center justify-center"
                    onClick={handleReload}
                >
                    New content available
                </button>
            )}
            <div className="fixed top-4 right-4 z-50">
                {subscription ? (
                    <button className="flex items-center justify-center" onClick={unsubscribeFromPush}>
                        {/* <Bell size={16} className="mr-2" /> */}
                        <Bell size={16} />
                    </button>
                ) : (
                    <button className="flex items-center justify-center" onClick={subscribeToPush}>
                        <Bell size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

export { PushNotificationManager };
