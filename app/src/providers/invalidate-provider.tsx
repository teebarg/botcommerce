import { useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useWebSocket } from "pulsews";
import { useEffect, useRef } from "react";

function parseEventKey(eventKey: string): string[] {
    return eventKey.split(":");
}

export function InvalidateProvider({ children }: { children: React.ReactNode }) {
    const { session } = useRouteContext({ strict: false });
    const queryClient = useQueryClient();
    const { lastMessage, send, isConnected } = useWebSocket();
    const userInitSentRef = useRef<boolean>(false);

    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.type === "invalidate") {
            const keys = parseEventKey(lastMessage.key);

            queryClient.invalidateQueries({ queryKey: keys });
        }
    }, [lastMessage, queryClient]);

    useEffect(() => {
        if (session && isConnected && !userInitSentRef.current) {
            send(
                JSON.stringify({
                    type: "init",
                    id: session.id,
                    email: session.user.email,
                })
            );

            userInitSentRef.current = true;
        }
    }, [session, isConnected]);
    return <div>{children}</div>;
}
