import { useState, useCallback, useEffect } from "react";
import { ChatMessage, ChatResponse } from "./types";

const generateId = () => Math.random().toString(36).slice(2, 10);
const STORAGE_KEY = "support-chat-history";

const WELCOME_MESSAGES: ChatMessage[] = [
    {
        id: generateId(),
        role: "agent",
        text: "Hi! I'm Alex from support 👋 How can I help you today?",
        timestamp: new Date(),
    },
    {
        id: generateId(),
        role: "agent",
        text: "",
        timestamp: new Date(),
        quick_replies: ["Track my order", "Product recommendations", "Return an item", "Talk to a human"],
    },
];

const loadHistory = (): ChatMessage[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return WELCOME_MESSAGES;
        const parsed = JSON.parse(raw) as ChatMessage[];
        // Rehydrate Date objects
        return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
        return WELCOME_MESSAGES;
    }
};

const saveHistory = (messages: ChatMessage[]) => {
    try {
        // Keep last 100 messages to avoid bloating storage
        const toSave = messages.slice(-100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
        // storage full — silently fail
    }
};

function getSessionId(): string {
    if (typeof window === "undefined") return crypto.randomUUID();
    let id = sessionStorage.getItem("chat_session_id");
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("chat_session_id", id);
    }
    return id;
}

export const useSupportChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
    const [loading, setLoading] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);

    useEffect(() => {
        saveHistory(messages);
    }, [messages]);

    const addMessage = useCallback((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const clearHistory = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages(WELCOME_MESSAGES);
    }, []);

    const sendMessage = useCallback(
        async (text: string, _file?: File) => {
            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                text,
                timestamp: new Date(),
            };
            addMessage(userMsg);
            setIsTyping(true);

            try {
                const res = await fetch(`${import.meta.env.VITE_AGENT_API}/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text,
                        session_id: getSessionId(),
                        customer_id: "Beaf",
                    }),
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data: ChatResponse = await res.json();

                const agentMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "agent",
                    text: data?.reply || "",
                    timestamp: new Date(),
                    sources: data?.sources || [],
                    escalated: data?.escalated || false,
                    products: data?.products || [],
                };

                setMessages((prev) => [...prev, agentMsg]);
                // if (!open) setUnread((n) => n + 1);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "agent",
                        text: "Sorry, I couldn't connect. Please try again.",
                        timestamp: new Date(),
                        sources: [],
                        escalated: false,
                        products: [],
                    },
                ]);
            } finally {
                setLoading(false);
                setIsTyping(false);
            }
        },
        [addMessage]
    );

    const reactToMessage = useCallback((id: string, reaction: "thumbs-up" | "thumbs-down") => {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m)));
    }, []);

    return { messages, isTyping, loading, sendMessage, reactToMessage, clearHistory };
};
