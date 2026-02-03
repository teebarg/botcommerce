import React, { useEffect, useState } from "react";
import { Bell, Download, Smartphone, Wifi, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

declare global {
    interface BeforeInstallPromptEvent extends Event {
        prompt: () => void;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    }
}

const features = [
    { icon: Zap, label: "Lightning fast" },
    { icon: Bell, label: "Push notifications" },
    { icon: Wifi, label: "Works offline" },
];

const InstallPrompt: React.FC = () => {
    const [isIOS, setIsIOS] = useState<boolean>(false);
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [hasDismissed, setHasDismissed] = useState<boolean>(false);
    const [isInstalling, setIsInstalling] = useState<boolean>(false);

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
        if (!deferredPrompt) return;

        setIsInstalling(true);
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setHasDismissed(true);
                localStorage.setItem("deferredPrompt", "true");
                setIsStandalone(true);
            }
        } catch (error) {
            console.error("Install failed:", error);
        } finally {
            setIsInstalling(false);
            setDeferredPrompt(null);
        }
    };

    if (hasDismissed || !deferredPrompt || isStandalone) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                onClick={handleClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] z-50"
            >
                <div className="bg-card rounded-t-3xl md:rounded-3xl border border-border shadow-2xl overflow-hidden">
                    <div className="relative h-48 gradient-primary overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-64 rounded-3xl border-4 border-white/50 bg-white/10">
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/50" />
                            </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-3">
                                    <span className="font-display font-bold text-primary text-3xl">R</span>
                                </div>
                                <Smartphone className="w-6 h-6 text-white/80" />
                            </motion.div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    <div className="p-6 text-center">
                        <h3 className="font-bold text-xl">Add Revoque to Home Screen</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-5">Get instant access with our app-like experience</p>

                        <div className="flex justify-center gap-6 mb-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-2">
                                        <feature.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{feature.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {isIOS ? (
                            <div className="p-2 rounded-md bg-secondary mb-4">
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
                            </div>
                        ) : (
                            <Button
                                onClick={handleInstall}
                                disabled={isInstalling}
                                size="lg"
                                className="w-full gradient-primary border-0 h-12 text-base"
                            >
                                {isInstalling ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Install App
                                    </>
                                )}
                            </Button>
                        )}

                        <button
                            onClick={handleClose}
                            className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export { InstallPrompt };
