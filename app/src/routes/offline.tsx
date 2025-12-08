import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CloudOff, RefreshCcw, WifiOff } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/offline")({
    component: RouteComponent,
});

function RouteComponent() {
    const [isRetrying, setIsRetrying] = useState(false);
    const [showAnimation, setShowAnimation] = useState(true);

    useEffect(() => {
        if (isRetrying) {
            setShowAnimation(false);
            setTimeout(() => setShowAnimation(true), 100);
        }
    }, [isRetrying]);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            const response = await fetch("/api/health-check");

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.log("Still offline");
        }
        setIsRetrying(false);
    };

    return (
        <div className="bg-linear-to-b from-background/20 to-secondary/20 flex items-center justify-center p-4 flex-1">
            <div className="max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
                <div className={cn("mb-8 relative", { "animate-bounce": showAnimation })}>
                    <div className="relative">
                        <WifiOff className="w-24 h-24 mx-auto text-muted-foreground" strokeWidth={1.5} />
                        <CloudOff className="w-12 h-12 absolute -bottom-2 -right-2 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-4">{`You're Offline`}</h1>

                <p className="text-muted-foreground mb-8">
                    {`It seems you've lost your internet connection. Don't worry - your data is safe and you can still access previously loaded content.`}
                </p>

                <Button aria-label="retry" className="px-8  text-white" color="warning" disabled={isRetrying} onClick={handleRetry}>
                    <RefreshCcw className={cn("w-5 h-5", isRetrying && "animate-spin")} />
                    {isRetrying ? "Retrying..." : "Try Again"}
                </Button>

                <div className="mt-8 pt-8 border-t border-input">
                    <h2 className="text-sm font-semibold mb-4">{`While you're offline, you can:`}</h2>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• View previously loaded content</li>
                        <li>• Check your internet connection</li>
                        <li>• Try connecting to a different network</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
