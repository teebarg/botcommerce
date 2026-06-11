import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useRouteContext } from "@tanstack/react-router";
import { useWebSocket } from "pulsews";
import { useEffect, useRef } from "react";
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

export function InvalidateProvider({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const pathname = location.pathname;
    const { session, isAuthenticated } = useRouteContext({ strict: false });
    const { cart } = useCart();
    const queryClient = useQueryClient();
    const { lastMessage, send, isConnected } = useWebSocket();
    const prevConnectedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.type === "invalidate") {
            const handleInvalidation = (keySegments: string[]) => {
                if (keySegments[0] === "cart" && keySegments[1]) {
                    const incomingCartId = keySegments[1];
                    if (incomingCartId === cart?.cart_number) {
                        queryClient.invalidateQueries({ queryKey: ["cart"] });
                    }
                    return;
                }
                queryClient.invalidateQueries({ queryKey: keySegments });
            };

            if (lastMessage.key) {
                const keys = parseEventKey(lastMessage.key);
                handleInvalidation(keys);
            }

            if (lastMessage.keys) {
                const keysArray = parseEventKeys(lastMessage.keys);
                keysArray.forEach((keySegments: string[]) => {
                    handleInvalidation(keySegments);
                });
            }
        }
    }, [lastMessage, queryClient, cart]);

    useEffect(() => {
        if (isAuthenticated && isConnected && !prevConnectedRef.current) {
            send(
                JSON.stringify({
                    type: "init",
                    id: session?.id,
                    email: session?.user.email,
                })
            );
        }
        prevConnectedRef.current = isConnected;
    }, [isAuthenticated, isConnected]);

    useEffect(() => {
        send(
            JSON.stringify({
                type: "path",
                path: pathname,
            })
        );
    }, [pathname]);
    return <div>{children}</div>;
}
