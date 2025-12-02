import { createServerFn } from "@tanstack/react-start";

export const pushEventFn = createServerFn({ method: "POST" }).handler(async ({ data }) => {
    const backendRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notification/push-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    return backendRes.json();
});
