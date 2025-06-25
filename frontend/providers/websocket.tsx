"use client";

import { useMe } from "@/lib/hooks/useApi";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

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
    const pathname = usePathname();

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!user || !socketRef.current) return;
        socketRef.current.send(JSON.stringify({ type: "init", id: user?.id, email: user?.email }));
    }, [user?.id]);

    useEffect(() => {
        if (!socketRef.current) return;
        socketRef.current.send(JSON.stringify({ type: "path", path: pathname }));
    }, [pathname]);

    useEffect(() => {
        if (socketRef.current) return;

        const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS}/api/ws/`);

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

        const pingInterval = setInterval(() => {
            socket.send(JSON.stringify({ type: "ping" }));
        }, 5000);

        socketRef.current = socket;

        return () => {
            clearInterval(pingInterval);
            socket.close();
        };
    }, []);

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
