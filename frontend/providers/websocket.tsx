"use client";

import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { useInvalidate } from "@/lib/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

type WebSocketContextType = {
    socket: WebSocket | null;
    messages: any[];
    currentMessage: any;
    error: Event | null;
    sendMessage: (msg: string) => void;
    retryConnection: () => void;
    reconnecting: boolean;
    reconnectAttempts: number;
};

const MAX_RECONNECT_ATTEMPTS = 5;

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<any[]>([]);
    const [currentMessage, setCurrentMessage] = useState<any>(null);
    const [error, setError] = useState<Event | null>(null);
    const [reconnecting, setReconnecting] = useState<boolean>(false);
    const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

    const pathname = usePathname();

    const socketRef = useRef<WebSocket | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnectRef = useRef<boolean>(true);
    const userInitSentRef = useRef<boolean>(false);
    const userRef = useRef(session);
    const invalidate = useInvalidate();

    function parseEventKey(eventKey: string): string[] {
        return eventKey.split(":");
    }

    const connect = async () => {
        try {
            const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS}/api/ws/`);

            socketRef.current = socket;

            socket.onopen = () => {
                setReconnecting(false);
                setReconnectAttempts(0);

                pingIntervalRef.current = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: "ping" }));

                        if (!userInitSentRef.current && userRef.current) {
                            socket.send(JSON.stringify({ type: "init", id: userRef.current.id, email: userRef.current.user.email }));
                            userInitSentRef.current = true;
                        }
                    }
                }, 15000);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data?.type === "invalidate") {
                    const keys = parseEventKey(data?.key);

                    queryClient.invalidateQueries({ queryKey: keys });
                }

                if (data?.type === "product-index" && data?.status === "completed") {
                    invalidate("products");
                    invalidate("gallery");
                }

                setMessages((prev) => [...prev, data]);
                setCurrentMessage(data);
            };

            socket.onerror = (err) => {
                setError(err);
            };

            socket.onclose = () => {
                console.warn("WebSocket disconnected");

                clearInterval(pingIntervalRef.current!);
                pingIntervalRef.current = null;

                if (shouldReconnectRef.current && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    const attempt = reconnectAttempts + 1;
                    const delay = Math.min(1000 * 2 ** attempt, 30000); // up to 30s

                    console.warn(`Attempting to reconnect in ${delay / 1000}s... (Attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS})`);

                    setReconnecting(true);
                    setReconnectAttempts(attempt);
                    userInitSentRef.current = false;

                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log("retrying connection....");
                        connect();
                    }, delay);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.error("Max reconnect attempts reached. Connection failed.");
                    setReconnecting(false);
                }
            };
        } catch (err) {
            console.error("Failed to connect WebSocket:", err);
        }
    };

    const retryConnection = () => {
        clearTimeout(reconnectTimeoutRef.current!);
        setReconnectAttempts(0);
        connect();
    };

    useEffect(() => {
        connect();

        return () => {
            shouldReconnectRef.current = false;
            clearInterval(pingIntervalRef.current!);
            clearTimeout(reconnectTimeoutRef.current!);
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        userRef.current = session;
    }, [session?.user]);

    useEffect(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "path", path: pathname }));
        }
    }, [pathname]);

    const sendMessage = (msg: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(msg);
        }
    };

    return (
        <WebSocketContext.Provider
            value={{
                socket: socketRef.current,
                messages,
                currentMessage,
                error,
                sendMessage,
                retryConnection,
                reconnecting,
                reconnectAttempts,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }

    return context;
};
