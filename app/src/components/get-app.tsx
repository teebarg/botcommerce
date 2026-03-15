import { RectangleVertical, ShareIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

function isInStandaloneMode() {
    return "standalone" in window.navigator && (window.navigator as any).standalone;
}

const STORAGE_KEY = "ios-install-banner-count";
const DISMISSED_KEY = "ios-install-banner-dismissed";
const MAX_VIEWS = 5;

const GetApp: React.FC = () => {
    const [isIOS, setIsIOS] = useState<boolean>(false);
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [showIosBanner, setShowIosBanner] = useState<boolean>(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    }, []);

    useEffect(() => {
        if ((window as any).deferredPrompt) {
            setInstallPrompt((window as any).deferredPrompt);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        const manualHandler = () => {
            setInstallPrompt((window as any).deferredPrompt);
        };
        const onOnline = () => setIsOffline(false);
        const onOffline = () => setIsOffline(true);

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("pwa-install-available", manualHandler);
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);

        if (isIOS && !isInStandaloneMode()) {
            const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
            const count = Number(localStorage.getItem(STORAGE_KEY) || "0");

            if (!dismissed && count < MAX_VIEWS) {
                setShowIosBanner(true);
                localStorage.setItem(STORAGE_KEY, String(count + 1));
            }
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("pwa-install-available", manualHandler);
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    }, []);

    const handleInstallClick = async () => {
        const prompt = installPrompt || (window as any).deferredPrompt;
        if (!prompt) return;

        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
            setInstallPrompt(null);
            (window as any).deferredPrompt = null;
        }
    };

    const handleClose = () => {
        setShowIosBanner(false);
        localStorage.setItem(DISMISSED_KEY, "true");
    };

    const handleRemindLater = () => {
        setShowIosBanner(false);
    };

    if (isOffline) {
        return (
            <div className="fixed top-0 left-0 w-full bg-destructive text-destructive-foreground py-1 text-center text-xs font-medium z-[200]">
                No internet connection. Using offline mode.
            </div>
        );
    }

    if (isStandalone) return null;

    if (showIosBanner) {
        return (
            <div className="fixed inset-x-4 top-16 z-70 rounded-2xl bg-white/95 shadow-xl border border-gray-200 backdrop-blur-sm overflow-hidden">
                <div className="h-1 w-full bg-gradient-action" />
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <RectangleVertical className="text-primary" size={20} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">Add to Home Screen</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Tap <ShareIcon className="inline-block mx-0.5 align-text-bottom" /> in your browser, then{" "}
                                <span className="font-medium text-gray-700">Add to Home Screen</span>.
                            </p>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleRemindLater}
                                    className="text-xs text-primary font-medium px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="text-xs text-gray-500 font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Don't show again
                                </button>
                            </div>
                        </div>
                        <button aria-label="Close" onClick={handleClose} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!installPrompt) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-500 transition-colors rounded-full px-3 py-1.5"
        >
            <RectangleVertical size={16} />
            <span className="text-sm font-medium">Get App</span>
        </button>
    );
};

export default GetApp;
