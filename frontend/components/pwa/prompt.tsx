"use client";

import { useEffect, useState } from "react";
import { CancelIcon } from "nui-react-icons";

import { Button } from "@/components/ui/button";

declare global {
    interface BeforeInstallPromptEvent extends Event {
        prompt: () => void;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    }
}

function InstallPrompt() {
    const [isIOS, setIsIOS] = useState<boolean>(false);
    // const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

        // setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
        // console.log(window.matchMedia("(display-mode: standalone)").matches);

        // Capture the install prompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Show the install prompt
            await deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt");
            } else {
                console.log("User dismissed the install prompt");
            }

            // Clear the deferredPrompt
            setDeferredPrompt(null);
        }
    };

    if (!deferredPrompt) {
        return null; // Don't show install button if already installed
    }

    return (
        <>
            <div className="fixed bottom-4 left-4 right-4 md:max-w-[25rem] z-50">
                <div className="bg-content2 rounded-lg shadow-xl p-8">
                    {/* Close button */}
                    <button
                        aria-label="cancel"
                        className="absolute top-2 right-2 text-default-500 hover:text-default-500/50"
                        onClick={() => setDeferredPrompt(null)}
                    >
                        <CancelIcon className="h-6 w-6" />
                    </button>

                    {/* Icon and content container */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-blue-500 p-3 rounded-full">{/* <ShoppingBag className="w-6 h-6 text-white" /> */}</div>

                        <div className="flex-1">
                            <h3 className="font-semibold text-default-900 mb-1">Install Our App</h3>
                            <p className="text-sm text-default-500 mb-3">Get faster checkout, exclusive offers and real-time order tracking</p>

                            {/* Install button */}
                            <Button aria-label="install" className="w-full space-x-2" color="primary" onClick={handleInstallClick}>
                                {/* <Download size={20} /> */}
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
        </>
    );
}

export { InstallPrompt };
