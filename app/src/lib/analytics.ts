import { baseURL } from "@/utils/api";

const ENDPOINT = "/analytics/event";

export function track(event: string, meta: Record<string, unknown> = {}) {
    const payload = JSON.stringify({
        event,
        meta,
        url: window.location.pathname,
        ts: new Date().toISOString(),
    });

    try {
        const sent = navigator.sendBeacon?.(`${baseURL}/api${ENDPOINT}`, new Blob([payload], { type: "application/json" }));

        if (!sent) {
            fetch(`${baseURL}/api${ENDPOINT}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
            });
        }
    } catch {}
}
