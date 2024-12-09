"use client";

import { useState, useEffect } from "react";
import { Bell, Send } from "nui-react-icons";

import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";
import { useSnackbar } from "notistack";

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
        console.error("Failed to decode Base64 string:", error);
        throw new Error("Error decoding Base64 string");
    }
}

function PushNotificationManager() {
    const { enqueueSnackbar } = useSnackbar();
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [newContent, setNewContent] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const broadcast = new BroadcastChannel("sw-messages");

        broadcast.addEventListener("message", (event) => {
            if (event.data.type === "NEW_CONTENT_AVAILABLE") {
                console.log("Show new content banner");
                setNewContent(true);
            }
        });

        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            registerServiceWorker();
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
            alert("Notification permission not granted");

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

    async function sendTestNotification() {
        if (subscription) {
            try {
                await sendNotification(message);
                setMessage("");
            } catch (error: any) {
                enqueueSnackbar("An error occurred sending to notifications" + error.message, { variant: "error" });
            }
        }
    }

    function handleReload() {
        window.location.reload();
    }

    if (!isSupported) {
        return <p>Push notifications are not supported in this browser.</p>;
    }

    return (
        <div className="bg-white shadow-lg rounded-xl max-w-md mx-auto p-8">
            <div className="flex items-center mb-4">
                {subscription ? <Bell className="text-blue-600 mr-3" size={24} /> : <Bell className="text-gray-400 mr-3" size={24} />}
                <h3 className="text-xl font-semibold text-gray-800">Push Notifications</h3>
            </div>
            {newContent && (
                <button
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center justify-center"
                    onClick={handleReload}
                >
                    New content available
                </button>
            )}

            {subscription ? (
                <div className="space-y-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-green-700 flex items-center">
                            <span className="mr-2">✅</span>
                            You are subscribed to push notifications
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <input
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter notification message"
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                            disabled={!message}
                            onClick={sendTestNotification}
                        >
                            <Send className="mr-2" size={16} />
                            Send
                        </button>
                    </div>

                    <button
                        className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center"
                        onClick={unsubscribeFromPush}
                    >
                        {/* <BellOff size={16} className="mr-2" /> */}
                        Unsubscribe
                    </button>
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <p className="text-gray-600">Get instant updates and stay informed</p>
                    <button
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center justify-center"
                        onClick={subscribeToPush}
                    >
                        <Bell className="mr-2" size={16} />
                        Enable Notifications
                    </button>
                </div>
            )}
        </div>
    );
}

export { PushNotificationManager };
