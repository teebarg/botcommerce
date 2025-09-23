"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Message } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import { Bell, X } from "lucide-react";
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

export default function PushPermission() {
    const [permission, setPermission] = useState(Notification.permission);
    const [subscription, setSubscription] = useState<PushSubscription | any | null>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(false);

    useEffect(() => {
        if (localStorage.getItem("push_synced") === "true") {
            setIsDismissed(true);
        }
        if (permission === "granted" && localStorage.getItem("push_synced") !== "true") {
            setIsDismissed(true);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
            setIsDismissed(false);
            return;
        }

        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(api.post<Message>("/push-fcm", subscriptionData));

        if (error) {
            toast.error(error);

            return;
        }

        setSubscription(sub);
        localStorage.setItem("push_synced", "true");
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
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });

        if (!sub) {
            toast.error("You blocked notifications. Please re-enable in browser settings.", {
                duration: 5000,
            });

            return;
        }

        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(api.post<Message>("/push-fcm", subscriptionData));

        if (error) {
            toast.error(error);

            return;
        }

        setSubscription(sub);
        localStorage.setItem("push_synced", "true");
    }

    if (isDismissed || permission === "granted") return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
            <div className="max-w-md mx-auto bg-gradient-to-r from-blue-700 to-cyan-500 rounded-lg shadow-strong border border-white/20 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Bell className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">Special Offer Alerts!</p>
                            <p className="text-white/80 text-xs">Enable notification to receive your offer</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            onClick={handleNotificationOptIn}
                            className="bg-white text-primary hover:bg-white/90 h-8 px-3 text-xs font-semibold"
                        >
                            Enable
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDismissed(true)}
                            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
