"use client";

import { useEffect, useState } from "react";
import { RightArrowIcon } from "nui-react-icons";

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
            <div className="flex w-full items-center justify-center gap-x-3 py-2 border-b">
                <div className="text-small flex items-end sm:text-[0.93rem] text-foreground hover:opacity-80 transition-opacity">
                    <span aria-label="rocket" className="hidden md:block" role="img">
                        🚀
                    </span>
                    <span
                        className="inline-flex md:ml-1 animate-text-gradient font-medium bg-clip-text text-transparent bg-[linear-gradient(90deg,#D6009A_0%,#8a56cc_50%,#D6009A_100%)] dark:bg-[linear-gradient(90deg,#FFEBF9_0%,#8a56cc_50%,#FFEBF9_100%)]"
                        style={{ fontSize: "inherit", backgroundSize: "200%", backgroundClip: "text" }}
                    >
                        Add to Home Screen
                    </span>
                </div>
                <Button className="min-w-[100px] gap-2 !rounded-full p-[1px]" onClick={handleInstallClick}>
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F54180_0%,#338EF7_50%,#F54180_100%)]" />
                    <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background group-hover:bg-background/70 transition-background px-3 py-1 text-sm font-medium text-foreground backdrop-blur-3xl">
                        Install
                        <RightArrowIcon
                            aria-hidden="true"
                            className="outline-none transition-transform group-hover:translate-x-0.5 [&amp;>path]:stroke-[2px]"
                            role="img"
                            size={16}
                        />
                    </div>
                </Button>
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
