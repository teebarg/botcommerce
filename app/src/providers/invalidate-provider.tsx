import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "pulsews";
import { useEffect } from "react";

function parseEventKey(eventKey: string): string[] {
    return eventKey.split(":");
}

export function InvalidateProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { lastMessage } = useWebSocket();
    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.type === "invalidate") {
            const keys = parseEventKey(lastMessage.key);

            queryClient.invalidateQueries({ queryKey: keys });
        }
    }, [lastMessage, queryClient]);
    return <div>{children}</div>;
}
