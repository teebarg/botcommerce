import { useState, useCallback } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

    const steps = [
        { num: "Step 1", title: "Check your connection", body: "Confirm WiFi or mobile data is turned on and has signal." },
        { num: "Step 2", title: "Disable airplane mode", body: "Airplane mode blocks all network access — turn it off if enabled." },
        { num: "Step 3", title: "Move closer to your router", body: "A weak signal can look identical to no connection at all." },
    ];

    return (
        <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-background px-6">
            <div className="max-w-3xl w-full mx-auto py-10">
                <div className="pb-8 flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center">
                        <WifiOff className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Connection</p>
                        <h1 className="text-3xl font-medium mb-2">You're offline</h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            It looks like you've lost your internet connection. Follow the steps below, then try reconnecting.
                        </p>
                    </div>
                </div>
                {steps.map(({ num, title, body }) => (
                    <div key={num}>
                        <Separator className="my-6" />
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">{num}</p>
                        <h2 className="text-base font-medium mb-2">{title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                ))}
                <Separator className="my-6" />
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Status</p>
                <h2 className="text-base font-medium mb-2">Reconnect</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    We'll bring you back automatically once a connection is detected — or check manually below.
                </p>
                <div className="rounded-xl border bg-muted/40 px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                        <span className="font-medium text-foreground">No connection detected</span>
                    </div>
                    <Button onClick={checkConnection} disabled={isChecking} size="sm" className="gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
                        {isChecking ? "Checking…" : "Try again"}
                    </Button>
                </div>
                <div className="mt-10 pt-6 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : "Not checked yet"}
                    </span>
                    <span className="text-xs text-muted-foreground">We'll reconnect automatically</span>
                </div>
            </div>
        </div>
    );
};

export default OfflinePage;