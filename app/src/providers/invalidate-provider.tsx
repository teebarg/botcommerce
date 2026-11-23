import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useRouteContext } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useWebSocket, useWebSocketMessage } from "./realtime-provider";
import { useCart } from "./cart-provider";

function parseEventKey(eventKey: string): string[] {
    try {
        return eventKey.split(":");
    } catch (error) {
        console.error("Error parsing event key:", error);
        return [];
    }
}

function parseEventKeys(eventKeys: string[]): string[][] {
    return eventKeys.map(parseEventKey);
}

// A broadcast reaches every connected visitor at once. For shared catalog data we spread the
// refetches over a few seconds so one admin edit doesn't make every open tab hit the API together.
// The user's own data (cart, orders, wallet, ...) is refreshed immediately.
const CATALOG_JITTER_MS = 3000;
const IMMEDIATE_KEYS = new Set(["cart", "orders", "order", "order-timeline", "wallet", "chat", "notifications", "user", "activity"]);

export function InvalidateProvider({ children }: { children: React.ReactNode }) {
    return <InvalidateProviderInner>{children}</InvalidateProviderInner>;
}

function InvalidateProviderInner({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const pathname = location.pathname;
    const { isAuthenticated } = useRouteContext({ strict: false });
    const { cart } = useCart();
    const queryClient = useQueryClient();
    const { send, isConnected } = useWebSocket();
    const prevConnectedRef = useRef<boolean>(false);
    const hasConnectedBeforeRef = useRef<boolean>(false);
    const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            timers.forEach(clearTimeout);
            timers.clear();
        };
    }, []);

    const invalidate = (queryKey: string[]) => {
        if (IMMEDIATE_KEYS.has(queryKey[0])) {
            queryClient.invalidateQueries({ queryKey });
            return;
        }
        const timer = setTimeout(() => {
            timersRef.current.delete(timer);
            queryClient.invalidateQueries({ queryKey });
        }, Math.random() * CATALOG_JITTER_MS);
        timersRef.current.add(timer);
    };

    useWebSocketMessage(
        (message) => {
            if (message.type !== "invalidate") return;
            const handleInvalidation = (keySegments: string[]) => {
                if (keySegments?.[0] === "cart" && keySegments[1]) {
                    const incomingCartId = keySegments[1];
                    if (incomingCartId === cart?.cart_number) {
                        queryClient.invalidateQueries({ queryKey: ["cart"] });
                    }
                    return;
                }
                invalidate(keySegments);
            };

            if (message.key) {
                handleInvalidation(parseEventKey(message.key));
            }

            if (message.keys) {
                parseEventKeys(message.keys).forEach(handleInvalidation);
            }
        },
        [queryClient]
    );

    useEffect(() => {
        if (isAuthenticated && isConnected && !prevConnectedRef.current) {
            send(JSON.stringify({ type: "init" }));
            if (hasConnectedBeforeRef.current) {
                queryClient.invalidateQueries({ queryKey: ["orders"] });
                queryClient.invalidateQueries({ queryKey: ["products"] });
                queryClient.invalidateQueries({ queryKey: ["gallery"] });
            }

            hasConnectedBeforeRef.current = true;
        }
        prevConnectedRef.current = isConnected;
    }, [isAuthenticated, isConnected, send, queryClient]);

    useEffect(() => {
        if (isConnected) {
            send(
                JSON.stringify({
                    type: "path",
                    path: pathname,
                })
            );
        }
    }, [pathname, isConnected, send]);

    return <>{children}</>;
}
