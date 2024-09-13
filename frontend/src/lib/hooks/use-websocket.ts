import { useState } from "react";

interface Props {
    onOpen?: () => void;
    onClose?: () => void;
    type?: string[];
}

const useWebSocket = ({ onOpen, onClose, type = [] }: Props) => {
    const [socket, setSocket] = useState<WebSocket>();
    const [messages, setMessages] = useState<any[]>([]);
    const [error, setError] = useState<Event>();

    const connect = async (url: string) => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            // socket.send(JSON.stringify({ type: "auth", token: "jwt token" }));
            if (typeof onOpen === "function") {
                onOpen();
            }
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (type.length && !type.includes(data.type)) {
                return;
            }
            setMessages((prev: any[]) => [...prev, JSON.parse(event.data)]);
        };

        socket.onclose = () => {
            if (typeof onClose === "function") {
                onClose();
            }
        };

        socket.onerror = (error) => {
            setError(error);
        };

        setSocket(socket);
    };

    const disconnect = () => {
        if (socket) {
            socket.close();
        }
    };

    const sendMessage = (message: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }
    };

    return {
        messages,
        error,
        connect,
        disconnect,
        sendMessage,
    };
};

export { useWebSocket };
