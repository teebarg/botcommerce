"use client";

// WebSocketProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { useMe } from "@/lib/hooks/useCart";

type WebSocketContextType = {
    socket: WebSocket | null;
    messages: any[];
    currentMessage: any;
    error: Event | null;
    sendMessage: (msg: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: user } = useMe();
    const [messages, setMessages] = useState<any[]>([]);
    const [currentMessage, setCurrentMessage] = useState<any>(null);
    const [error, setError] = useState<Event | null>(null);

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!user || socketRef.current) return;

        const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${user.id}/`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setMessages((prev) => [...prev, data]);
            setCurrentMessage(data);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        socket.onerror = (err) => {
            setError(err);
        };

        socketRef.current = socket;

        return () => {
            socket.close();
        };
    }, [user]);

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
