import { useEffect } from "react";

import { api } from "@/apis/client";

export type UserInteractionType = "VIEW" | "PURCHASE" | "CART_ADD" | "WISHLIST_ADD" | "WISHLIST_REMOVE";

type RecentlyViewed = {
    name: string
    slug: string
    image: string
    price: number
    old_price?: number
    variant_id?: number
    rating?: number
    review_count?: number
}

export interface UserInteractionPayload {
    user_id: number;
    product_id: number;
    type: UserInteractionType;
    metadata?: Record<string, any>;
    details?: RecentlyViewed
}

let buffer: UserInteractionPayload[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
let retryCount = 0;

const flushBuffer = async () => {
    if (buffer.length === 0) return;
    const batch = [...buffer];

    buffer = [];
    try {
        await api.post("/user-interactions/batch", batch);
        retryCount = 0;
    } catch (err: any) {
        retryCount++;
        if (retryCount < 3) {
            buffer.push(...batch);
            setTimeout(flushBuffer, 2000 * retryCount);
        } else {
            retryCount = 0;
        }
    }
};

const scheduleFlush = () => {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushBuffer, 5000);
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
