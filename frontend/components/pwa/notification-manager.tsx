"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

import { subscribeUser, unsubscribeUser } from "./actions";
import { Button } from "../ui/button";
import { RightArrowIcon } from "nui-react-icons";

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
        console.log("register");
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        });
        const sub = await registration.pushManager.getSubscription();
        console.log("sub");
        console.log(sub);

        if (!sub) {
            // Don't auto-subscribe, let user initiate
            setSubscription(null);
            return;
        }

        setSubscription(sub);
    }

    // Add a new function to handle user opt-in
    async function handleNotificationOptIn() {
        console.log("yoooooooo");
        if (!isSupported) {
            enqueueSnackbar("Push notifications are not supported in your browser", { variant: "error" });
            return;
        }

        // await registerServiceWorker();
        await subscribeToPush();
    }

    async function subscribeToPush() {
        console.log("subscribd");
        const permissionGranted = await requestNotificationPermission();
        console.log("permissionGranted");
        console.log(permissionGranted);

        if (!permissionGranted) {
            enqueueSnackbar("Notification permission not granted", { variant: "error" });

            return;
        }
        const registration = await navigator.serviceWorker.ready;
        console.log(registration);
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });
        console.log(sub);

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
                <div className="flex w-full items-center justify-center gap-x-3 py-2 border-b">
                    <div className="text-small flex items-end sm:text-[0.93rem] text-foreground hover:opacity-80 transition-opacity">
                        <span aria-label="rocket" className="hidden md:block" role="img">
                            🚀
                        </span>
                        <span
                            className="inline-flex md:ml-1 animate-text-gradient font-medium bg-clip-text text-transparent bg-[linear-gradient(90deg,#D6009A_0%,#8a56cc_50%,#D6009A_100%)] dark:bg-[linear-gradient(90deg,#FFEBF9_0%,#8a56cc_50%,#FFEBF9_100%)]"
                            style={{ fontSize: "inherit", backgroundSize: "200%", backgroundClip: "text" }}
                        >
                            Enable Push Notifications
                        </span>
                    </div>
                    <Button className="min-w-[100px] gap-2 !rounded-full p-[1px]" onClick={handleNotificationOptIn}>
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F54180_0%,#338EF7_50%,#F54180_100%)]" />
                        <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background group-hover:bg-background/70 transition-background px-3 py-1 text-sm font-medium text-foreground backdrop-blur-3xl">
                            Enable
                            <RightArrowIcon
                                aria-hidden="true"
                                className="outline-none transition-transform group-hover:translate-x-0.5 [&amp;>path]:stroke-[2px]"
                                role="img"
                                size={16}
                            />
                        </div>
                    </Button>
                </div>
            )}
            {newContent && (
                <button
                    aria-label="reload page"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center justify-center"
                    onClick={handleReload}
                >
                    New content available
                </button>
            )}
        </div>
    );
}

export { PushNotificationManager };
