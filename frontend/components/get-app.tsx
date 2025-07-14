"use client";

import { RectangleVertical } from "lucide-react";
import { useEffect, useState } from "react";

const GetApp: React.FC = () => {
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
            setIsStandalone(true);
        }
    }, []);

    useEffect(() => {
        // Listen for install events
        window.addEventListener("appinstalled", () => setIsStandalone(true));

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler as EventListener);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler as EventListener);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setIsStandalone(true);
            }
            setDeferredPrompt(null);
        }
    };

    if (isStandalone || !deferredPrompt) return null;

    return (
        <button
            className="flex items-center text-default-800 hover:text-default-500 cursor-pointer bg-content2 transition-colors rounded-full md:px-2 py-1.5"
            onClick={handleInstallClick}
        >
            <RectangleVertical />
            <span className="text-sm font-medium md:block hidden">Get App</span>
        </button>
    );
};

export default GetApp;
