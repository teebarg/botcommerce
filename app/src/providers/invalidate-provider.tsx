import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useRouteContext } from "@tanstack/react-router";
import { useWebSocket, useWebSocketMessage } from "pulsews";
import { useEffect, useRef, useState } from "react";
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
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <>{children}</>;
    }

    return <InvalidateProviderInner>{children}</InvalidateProviderInner>;
}

function InvalidateProviderInner({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const pathname = location.pathname;
    const { isAuthenticated, userId, user } = useRouteContext({ strict: false });
    const { cart } = useCart();
    const queryClient = useQueryClient();
    const { send, isConnected } = useWebSocket();
    const prevConnectedRef = useRef<boolean>(false);
    const hasConnectedBeforeRef = useRef<boolean>(false);

    useWebSocketMessage((message) => {
        if (message.type !== "invalidate") return;
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

        if (message.key) {
            handleInvalidation(parseEventKey(message.key));
        }

        if (message.keys) {
            parseEventKeys(message.keys).forEach(handleInvalidation);
        }
    }, [queryClient]);

    useEffect(() => {
        if (isAuthenticated && isConnected && !prevConnectedRef.current) {
            send(
                JSON.stringify({
                    type: "init",
                    id: userId,
                    email: user?.email,
                })
            );
            if (hasConnectedBeforeRef.current) {
                queryClient.invalidateQueries({ queryKey: ["orders"] });
                queryClient.invalidateQueries({ queryKey: ["products"] });
                queryClient.invalidateQueries({ queryKey: ["gallery"] });
            }
    
            hasConnectedBeforeRef.current = true;
        }
        prevConnectedRef.current = isConnected;
    }, [isAuthenticated, isConnected, send, user]);

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