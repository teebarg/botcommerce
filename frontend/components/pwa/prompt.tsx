"use client";

import { useEffect, useState } from "react";
import { Cancel } from "nui-react-icons";

import { Button } from "@/components/ui/button";
import ClientOnly from "@/components/generic/client-only";

declare global {
    interface BeforeInstallPromptEvent extends Event {
        prompt: () => void;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    }
}

const InstallPrompt: React.FC = () => {
    const [isIOS, setIsIOS] = useState<boolean>(false);
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [hasDismissed, setHasDismissed] = useState<boolean>(false);

    const handleClose = () => {
        setDeferredPrompt(null);
        localStorage.setItem("deferredPrompt", "true");

        setHasDismissed(true);
    };

    useEffect(() => {
        if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
            setIsStandalone(true);
        }
    }, []);

    useEffect(() => {
        const savedIsOpen = localStorage.getItem("deferredPrompt") === "true";

        setHasDismissed(savedIsOpen);
    }, []);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler as EventListener);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler as EventListener);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();

            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setHasDismissed(true);
                localStorage.setItem("deferredPrompt", "true");
                setIsStandalone(true);
            }

            setDeferredPrompt(null);
        }
    };

    if (hasDismissed || !deferredPrompt || isStandalone) {
        return null;
    }

    return (
        <ClientOnly>
            <div className="fixed bottom-4 left-4 right-4 md:max-w-100 z-50">
                <div className="bg-content2 rounded-lg shadow-xl p-8">

                    <button aria-label="cancel" className="absolute top-2 right-2 text-default-500 hover:text-default-500/50" onClick={handleClose}>
                        <Cancel className="h-6 w-6" />
                    </button>

                    <div className="flex items-start space-x-4">
                        <div className="bg-blue-500 p-3 rounded-full">{/* <ShoppingBag className="w-6 h-6 text-white" /> */}</div>

                        <div className="flex-1">
                            <h3 className="font-semibold text-default-900 mb-1">Install Our App</h3>
                            <p className="text-sm text-default-500 mb-3">Get faster checkout, exclusive offers and real-time order tracking</p>

                            <Button aria-label="install" className="w-full space-x-2" variant="primary" onClick={handleInstall}>
                                <span>Add to Home Screen</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {isIOS && (
                    <p className="text-sm font-semibold text-center mt-1">
                        To install this app on your iOS device, tap the share button
                        <span aria-label="share icon" role="img">
                            {" "}
                            ⎋{" "}
                        </span>
                        and then Add to Home Screen
                        <span aria-label="plus icon" role="img">
                            {" "}
                            ➕{" "}
                        </span>
                        .
                    </p>
                )}
            </div>
        </ClientOnly>
    );
};

export { InstallPrompt };
