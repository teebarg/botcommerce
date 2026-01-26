import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff, Wifi } from "lucide-react";

const OfflinePage = () => {
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const checkConnection = useCallback(async () => {
        setIsChecking(true);

        try {
            const response = await fetch("https://www.google.com/favicon.ico", {
                mode: "no-cors",
                cache: "no-store",
            });
            if (response) {
                window.location.reload();
            }
        } catch (error) {
            setLastChecked(new Date());
        } finally {
            setIsChecking(false);
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <WifiOff className="w-20 h-20 text-muted-foreground/40 animate-pulse" strokeWidth={1.5} />
                                <div className="absolute -top-2 -right-2">
                                    <div className="relative">
                                        <div className="w-3 h-3 rounded-full bg-error animate-ping absolute" />
                                        <div className="w-3 h-3 rounded-full bg-error" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-dashed border-muted-foreground/10"
                        style={{ animation: "spin 20s linear infinite" }}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-muted-foreground/5" />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-error-light border border-error-border text-error text-sm font-medium mb-4">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                    No Connection
                </div>

                <div className="space-y-4 mb-8">
                    <h1 className="text-2xl font-semibold text-foreground">You're offline</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        It looks like you've lost your internet connection. Check your network settings and try again.
                    </p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm font-medium text-foreground mb-2">Try these steps:</p>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            Check your WiFi or mobile data connection
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            Turn airplane mode off if enabled
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            Move closer to your router
                        </li>
                    </ul>
                </div>
                <Button onClick={checkConnection} disabled={isChecking} className="gap-2 px-8 py-5 text-base font-medium w-full sm:w-auto">
                    <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
                    {isChecking ? "Checking..." : "Try Again"}
                </Button>
                {lastChecked && <p className="mt-4 text-xs text-muted-foreground">Last checked: {lastChecked.toLocaleTimeString()}</p>}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Wifi className="w-4 h-4" />
                    <span>We'll reconnect automatically when you're back online</span>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default OfflinePage;
