"use client";

import { RectangleVertical, X } from "lucide-react";
import { useEffect, useState } from "react";

function isIos() {
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function isInStandaloneMode() {
    return "standalone" in window.navigator && (window.navigator as any).standalone;
}

const GetApp: React.FC = () => {
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosBanner, setShowIosBanner] = useState<boolean>(false);

    useEffect(() => {
        if (window.matchMedia("(display-mode: standalone)").matches || isInStandaloneMode()) {
            setIsStandalone(true);
        }
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler as EventListener);
        window.addEventListener("appinstalled", () => setIsStandalone(true));

        if (isIos() && !isInStandaloneMode()) {
            setShowIosBanner(true);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler as EventListener);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") setIsStandalone(true);
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) return null;

    if (showIosBanner) {
        return (
            <div className="fixed inset-x-4 bottom-6 z-70 rounded-2xl bg-white/95 shadow-xl border border-gray-200 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <RectangleVertical className="text-primary shrink-0 mt-0.5" />
                    <div className="text-gray-800 text-sm leading-relaxed">
                        <p>
                            Install this app: Tap <span className="font-semibold">Share</span> →{" "}
                            <span className="font-semibold">Add to Home Screen</span>.
                        </p>
                    </div>
                    <button
                        aria-label="Close"
                        className="ml-auto text-gray-400 hover:text-gray-600 transition"
                        onClick={() => setShowIosBanner(false)}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    if (!deferredPrompt) return null;

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
