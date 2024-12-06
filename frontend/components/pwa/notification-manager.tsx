"use client";

import { useState, useEffect } from "react";

import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";
import { Bell, Send } from "nui-react-icons";

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
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    async function requestNotificationPermission() {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
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
        console.log(permissionGranted)

        if (!permissionGranted) {
            alert("Notification permission not granted")
            return
        }
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });

        setSubscription(sub);
        await subscribeUser(sub);
    }

    async function unsubscribeFromPush() {
        await subscription?.unsubscribe();
        setSubscription(null);
        await unsubscribeUser();
    }

    async function sendTestNotification() {
        if (subscription) {
            await sendNotification(message);
            setMessage("");
        }
    }

    if (!isSupported) {
        return <p>Push notifications are not supported in this browser.</p>;
    }

    return (
        <div className="bg-white shadow-lg rounded-xl">
            <div className="flex items-center mb-4">
                {subscription ? <Bell className="text-blue-600 mr-3" size={24} /> : <Bell className="text-gray-400 mr-3" size={24} />}
                <h3 className="text-xl font-semibold text-gray-800">Push Notifications</h3>
            </div>

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
                            placeholder="Enter notification message"
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={sendTestNotification}
                            disabled={!message}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                        >
                            <Send size={16} className="mr-2" />
                            Send
                        </button>
                    </div>

                    <button
                        onClick={unsubscribeFromPush}
                        className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                        {/* <BellOff size={16} className="mr-2" /> */}
                        Unsubscribe
                    </button>
                    <button
                        onClick={subscribeToPush}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center justify-center"
                    >
                        <Bell size={16} className="mr-2" />
                        Enable Notifications
                    </button>
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <p className="text-gray-600">Get instant updates and stay informed</p>
                    <button
                        onClick={subscribeToPush}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center justify-center"
                    >
                        <Bell size={16} className="mr-2" />
                        Enable Notifications
                    </button>
                </div>
            )}
        </div>
    );

    // return (
    //     <div>
    //         <h3>Push Notifications</h3>
    //         {subscription ? (
    //             <>
    //                 <p>You are subscribed to push notifications.</p>
    //                 <button onClick={unsubscribeFromPush}>Unsubscribe</button>
    //                 <input placeholder="Enter notification message" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
    //                 <button onClick={sendTestNotification}>Send Test</button>
    //             </>
    //         ) : (
    //             <>
    //                 <p>You are not subscribed to push notifications.</p>
    //                 <button onClick={subscribeToPush}>Subscribe</button>
    //             </>
    //         )}
    //     </div>
    // );
}

export { PushNotificationManager };
