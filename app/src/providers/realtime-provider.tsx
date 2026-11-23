import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getSessionId } from "@/utils";

/**
 * Realtime (websocket) layer.
 *
 * Why this exists instead of using pulsews' <WebSocketProvider> directly:
 *  - The session id lives in localStorage, so it is only known after mount. Gating the provider on it
 *    meant the *entire app* (`children`) was not rendered on the server, and the tree changed shape
 *    right after hydration. Here the provider always renders `children` in the same position; the
 *    socket itself is opened by a separate, render-nothing component once the id is known.
 *  - Consumers get a safe no-op context during SSR / before the socket exists, so they never throw.
 */

type Handler = (data: any) => void;

interface RealtimeContextValue {
    isConnected: boolean;
    lastMessage: any;
    send: (data: any) => void;
    subscribe: (handler: Handler) => () => void;
}

const noop = () => {};
const defaultValue: RealtimeContextValue = {
    isConnected: false,
    lastMessage: null,
    send: noop,
    subscribe: () => noop,
};

const RealtimeContext = createContext<RealtimeContextValue>(defaultValue);

export function RealtimeProvider({ url, children }: { url: string; children: React.ReactNode }) {
    const [sessionId, setSessionId] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const handlers = useRef(new Set<Handler>());
    const sendRef = useRef<(data: any) => void>(noop);

    useEffect(() => {
        setSessionId(getSessionId());
    }, []);

    const dispatch = useCallback((data: any) => {
        setLastMessage(data);
        handlers.current.forEach((handler) => {
            try {
                handler(data);
            } catch (error) {
                console.error("Realtime handler failed:", error);
            }
        });
    }, []);

    const subscribe = useCallback((handler: Handler) => {
        handlers.current.add(handler);
        return () => {
            handlers.current.delete(handler);
        };
    }, []);

    const send = useCallback((data: any) => sendRef.current(data), []);

    const value = useMemo<RealtimeContextValue>(
        () => ({ isConnected, lastMessage, send, subscribe }),
        [isConnected, lastMessage, send, subscribe]
    );

    return (
        <RealtimeContext.Provider value={value}>
            {children}
            {sessionId ? (
                <SocketConnector
                    url={`${url}?session_id=${encodeURIComponent(sessionId)}`}
                    onMessage={dispatch}
                    onConnectionChange={setIsConnected}
                    sendRef={sendRef}
                />
            ) : null}
        </RealtimeContext.Provider>
    );
}

const HEARTBEAT_MS = 30_000;
const BASE_RETRY_MS = 3_000;
const MAX_RETRY_MS = 30_000;
const MAX_ATTEMPTS = 10;

/**
 * Owns the actual WebSocket: connects, heartbeats, and reconnects with backoff. Renders nothing.
 * (Written against the native WebSocket so it survives React StrictMode's mount/unmount/mount
 * cycle, which pulsews' hook does not.)
 */
function SocketConnector({
    url,
    onMessage,
    onConnectionChange,
    sendRef,
}: {
    url: string;
    onMessage: Handler;
    onConnectionChange: (connected: boolean) => void;
    sendRef: React.MutableRefObject<(data: any) => void>;
}) {
    useEffect(() => {
        let socket: WebSocket | null = null;
        let heartbeat: ReturnType<typeof setInterval> | undefined;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        let attempts = 0;
        let disposed = false;

        const clearTimers = () => {
            if (heartbeat) clearInterval(heartbeat);
            if (retryTimer) clearTimeout(retryTimer);
            heartbeat = undefined;
            retryTimer = undefined;
        };

        const connect = () => {
            if (disposed || (socket && socket.readyState <= WebSocket.OPEN)) return;
            try {
                socket = new WebSocket(url);
            } catch (error) {
                console.error("WebSocket could not be created:", error);
                return;
            }
            const current = socket;

            current.onopen = () => {
                attempts = 0;
                onConnectionChange(true);
                heartbeat = setInterval(() => {
                    if (current.readyState === WebSocket.OPEN) current.send(JSON.stringify({ type: "ping" }));
                }, HEARTBEAT_MS);
            };
            current.onmessage = (event) => {
                try {
                    onMessage(JSON.parse(event.data));
                } catch {
                    onMessage(event.data);
                }
            };
            current.onclose = () => {
                clearTimers();
                onConnectionChange(false);
                if (disposed || attempts >= MAX_ATTEMPTS) return;
                attempts += 1;
                retryTimer = setTimeout(connect, Math.min(BASE_RETRY_MS * 2 ** (attempts - 1), MAX_RETRY_MS));
            };
        };

        sendRef.current = (data) => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(typeof data === "string" ? data : JSON.stringify(data));
            }
        };

        // Coming back to the tab after the retries ran out: try again.
        const onVisible = () => {
            if (document.visibilityState === "visible" && (!socket || socket.readyState === WebSocket.CLOSED)) {
                attempts = 0;
                connect();
            }
        };
        document.addEventListener("visibilitychange", onVisible);

        connect();

        return () => {
            disposed = true;
            document.removeEventListener("visibilitychange", onVisible);
            clearTimers();
            sendRef.current = () => {};
            socket?.close();
            onConnectionChange(false);
        };
    }, [url, onMessage, onConnectionChange, sendRef]);

    return null;
}

/** Drop-in replacement for pulsews' `useWebSocket`; safe on the server and before the socket opens. */
export function useWebSocket(): RealtimeContextValue {
    return useContext(RealtimeContext);
}

/** Drop-in replacement for pulsews' `useWebSocketMessage`. */
export function useWebSocketMessage(handler: Handler, deps: React.DependencyList = []) {
    const { subscribe } = useWebSocket();
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    // biome-ignore lint/correctness/useExhaustiveDependencies: handler is read through a ref
    useEffect(() => subscribe((data) => handlerRef.current(data)), [subscribe, ...deps]);
}
