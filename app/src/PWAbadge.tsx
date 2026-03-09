import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, WifiOff, X } from "lucide-react";

function PWABadge() {
    // periodic sync is disabled, change the value to enable it, the period is in milliseconds
    // You can remove onRegisteredSW callback and registerPeriodicSync function
    const period = 0;

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, r) {
            if (period <= 0) return;
            if (r?.active?.state === "activated") {
                registerPeriodicSync(period, swUrl, r);
            } else if (r?.installing) {
                r.installing.addEventListener("statechange", (e) => {
                    const sw = e.target as ServiceWorker;
                    if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
                });
            }
        },
    });

    function close() {
        setOfflineReady(false);
        setNeedRefresh(false);
    }

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-3 rounded-xl bg-background border shadow-lg px-4 py-3 min-w-[260px]">
                <div className="text-primary">{offlineReady ? <WifiOff size={18} /> : <RefreshCw size={18} />}</div>

                <div className="flex-1 text-sm">{offlineReady ? <span>POS ready for offline use</span> : <span>System update available</span>}</div>

                <div className="flex items-center gap-2">
                    {needRefresh && (
                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-primary text-white hover:opacity-90"
                        >
                            Update
                        </button>
                    )}

                    <button onClick={close} className="p-1 rounded-md hover:bg-gray-100">
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PWABadge;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
    if (period <= 0) return;

    setInterval(async () => {
        if ("onLine" in navigator && !navigator.onLine) return;

        const resp = await fetch(swUrl, {
            cache: "no-store",
            headers: {
                cache: "no-store",
                "cache-control": "no-cache",
            },
        });

        if (resp?.status === 200) await r.update();
    }, period);
}
