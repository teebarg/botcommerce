"use client";

import { RectangleVertical, X } from "lucide-react";
import { useEffect, useState } from "react";

// function isIos() {
//     return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
// }

function isInStandaloneMode() {
    return "standalone" in window.navigator && (window.navigator as any).standalone;
}

const ShareIcon = () => (
    <svg
        className="inline-block align-text-bottom"
        fill="none"
        height="16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
);

const STORAGE_KEY = "ios-install-banner-count";
const DISMISSED_KEY = "ios-install-banner-dismissed";
const MAX_VIEWS = 5;

const GetApp: React.FC = () => {
    const [isIOS, setIsIOS] = useState<boolean>(false);
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosBanner, setShowIosBanner] = useState<boolean>(false);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    }, []);

    // useEffect(() => {
    //     if (window.matchMedia("(display-mode: standalone)").matches || isInStandaloneMode()) {
    //         setIsStandalone(true);
    //     }
    // }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler as EventListener);
        window.addEventListener("appinstalled", () => setIsStandalone(true));

        if (isIOS && !isInStandaloneMode()) {
            const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
            const count = Number(localStorage.getItem(STORAGE_KEY) || "0");

            if (!dismissed && count < MAX_VIEWS) {
                setShowIosBanner(true);
                localStorage.setItem(STORAGE_KEY, String(count + 1));
            }
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

    const handleClose = () => {
        setShowIosBanner(false);
        localStorage.setItem(DISMISSED_KEY, "true");
    };

    const handleRemindLater = () => {
        setShowIosBanner(false);
    };

    if (isStandalone) return null;

    if (showIosBanner) {
        return (
            <div className="fixed inset-x-4 top-16 z-70 rounded-2xl bg-white/95 shadow-xl border border-gray-200 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <RectangleVertical className="text-primary shrink-0 mt-0.5" />
                    <div className="text-gray-800 text-sm leading-relaxed">
                        <p>
                            Install this app: Tap{" "}
                            <span className="font-semibold flex items-center gap-1">
                                Share <ShareIcon />
                            </span>{" "}
                            → <span className="font-semibold">Add to Home Screen</span>.
                        </p>
                        <div className="flex gap-3 mt-3">
                            <button
                                className="text-xs text-primary font-medium px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition"
                                onClick={handleRemindLater}
                            >
                                Remind me later
                            </button>
                            <button
                                className="text-xs text-gray-600 font-medium px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                                onClick={handleClose}
                            >
                                {`Don't show again`}
                            </button>
                        </div>
                    </div>
                    <button aria-label="Close" className="ml-auto text-gray-400 hover:text-gray-600 transition" onClick={handleClose}>
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    if (!deferredPrompt) return null;

    return (
        <button
            className="flex items-center hover:text-muted-foreground cursor-pointer bg-secondary transition-colors rounded-full md:px-2 py-1.5"
            onClick={handleInstallClick}
        >
            <RectangleVertical />
            <span className="text-sm font-medium md:block hidden">Get App</span>
        </button>
    );
};

export default GetApp;
