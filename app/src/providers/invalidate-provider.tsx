import { useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useWebSocket } from "pulsews";
import { useEffect, useRef } from "react";

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
    const { session, isAuthenticated } = useRouteContext({ strict: false });
    const queryClient = useQueryClient();
    const { lastMessage, send, isConnected } = useWebSocket();
    const userInitSentRef = useRef<boolean>(false);

    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.type === "invalidate") {
            if (lastMessage.key) {
                const keys = parseEventKey(lastMessage.key);
                queryClient.invalidateQueries({ queryKey: keys });
            }
            if (lastMessage.keys) {
                const keys = parseEventKeys(lastMessage.keys);
                keys.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
        }
    }, [lastMessage, queryClient]);

    useEffect(() => {
        if (isAuthenticated && isConnected && !userInitSentRef.current) {
            send(
                JSON.stringify({
                    type: "init",
                    id: session?.id,
                    email: session?.user.email,
                })
            );

            userInitSentRef.current = true;
        }
    }, [isAuthenticated, isConnected]);
    return <div>{children}</div>;
}
