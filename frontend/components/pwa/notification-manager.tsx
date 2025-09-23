"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

const PushNotificationManager: React.FC = () => {
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
        }
    }, []);

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        });
    }

    const handleRefresh = () => {
        waitingWorker?.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
    };

    if (!show && !offline) return null;

    return (
        <div className="fixed bottom-4 left-1/2 z-50 w-[95vw] max-w-sm -translate-x-1/2 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-gray-900 shadow-2xl p-5 flex flex-col items-center animate-fade-in">
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
