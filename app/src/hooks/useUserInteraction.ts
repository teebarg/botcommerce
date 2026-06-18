import { useEffect } from "react";
import { api } from "@/utils/api";
import { Message } from "@/schemas";

export type UserInteractionType = "VIEW" | "PURCHASE" | "CART_ADD" | "WISHLIST_ADD" | "WISHLIST_REMOVE";

export interface UserInteractionPayload {
    product_id: number;
    type: UserInteractionType;
    metadata?: Record<string, any>;
}

let buffer: UserInteractionPayload[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
let retryQueue: UserInteractionPayload[] = [];
let retryCount = 0;

const flushBuffer = async () => {
    const batch = [...retryQueue, ...buffer];
    if (batch.length === 0) return;

    buffer = [];
    retryQueue = [];

    try {
        await api.post<Message>("/user-interactions/batch", batch);
        retryCount = 0;
    } catch (err: any) {
        retryCount++;
        if (retryCount < 3) {
            // Keep failures separated from fresh active tracking events
            retryQueue = batch;
            // Implement simple exponential backoff curve instead of strict 2-sec intervals
            const backoffTime = Math.pow(2, retryCount) * 2000;
            setTimeout(flushBuffer, backoffTime);
        } else {
            retryCount = 0;
        }
    }
};

const scheduleFlush = () => {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushBuffer, 15000);
};

export const useTrackUserInteraction = () => {
    // Flush on page hide/unload
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "hidden") flushBuffer();
        };

        window.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("beforeunload", flushBuffer);

        return () => {
            window.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("beforeunload", flushBuffer);
        };
    }, []);

    return {
        mutate: (payload: UserInteractionPayload) => {
            buffer.push(payload);
            scheduleFlush();
        },
    };
};
