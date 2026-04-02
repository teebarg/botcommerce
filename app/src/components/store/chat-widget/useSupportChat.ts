import { useState, useCallback, useEffect, useMemo } from "react";
import { ChatResponse } from "./types";
import { useWebSocket } from "pulsews";
import { useRouteContext } from "@tanstack/react-router";
import { useChat, useChatMutation } from "@/hooks/useApi";
import { ChatMessage } from "@/schemas";

const generateId = () => Math.random();
const STORAGE_KEY = "support-chat-history";
const now = () => new Date();

const WELCOME_MESSAGES: ChatMessage[] = [
    {
        id: generateId(),
        sender: "BOT",
        content: "Hi! I'm Alex from support 👋 How can I help you today?",
        timestamp: now(),
    },
    {
        id: generateId(),
        sender: "BOT",
        content: "",
        timestamp: now(),
        metadata: {
            quick_replies: ["Track my order", "Product recommendations", "Return an item", "Talk to a human"],
        },
    },
];

const loadLocalHistory = (): ChatMessage[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return WELCOME_MESSAGES;
        const parsed = JSON.parse(raw) as ChatMessage[];
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
    const { session, isAuthenticated } = useRouteContext({ strict: false });
    const { lastMessage } = useWebSocket();
    console.log("🚀 ~ file: useSupportChat.ts:64 ~ lastMessage:", lastMessage);
    const [messages, setMessages] = useState<ChatMessage[]>(loadLocalHistory);
    const [loading, setLoading] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [humanConnected, setHumanConnected] = useState<boolean>(false);
    const { data: dbHistory, isLoading: historyLoading } = useChat(getSessionId());
    const userSendChat = useChatMutation();

    const isDisabled = useMemo(() => {
        return loading || isTyping || (messages.at(-1)?.metadata?.escalated && messages.at(-1)?.sender == "BOT");
    }, [loading, isTyping]);

    useEffect(() => {
        if (historyLoading) return;

        if (dbHistory) {
            console.log("🚀 ~ file: useSupportChat.ts:78 ~ dbHistory:", dbHistory);
            const messagesToSet = dbHistory.messages.length > 0 ? [...WELCOME_MESSAGES, ...dbHistory.messages] : WELCOME_MESSAGES;
            setMessages(messagesToSet);
            saveHistory(messagesToSet);
            setHumanConnected(dbHistory.human_connected);
            return;
        }
        console.log("loading from local.....");
        setMessages(loadLocalHistory());
    }, [historyLoading, dbHistory]);

    useEffect(() => {
        const agentMsg: ChatMessage = {
            id: Date.now() + 1,
            sender: "SYSTEM",
            content: lastMessage.message || "",
            timestamp: now(),
        };

        setMessages((prev) => [...prev, agentMsg]);
    }, [lastMessage]);

    // useEffect(() => {
    //     saveHistory(messages);
    // }, [messages]);

    const addMessage = useCallback((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const clearHistory = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages(WELCOME_MESSAGES);
    }, []);

    const handleSendMessage = async (text: string, _file?: File) => {
        if (humanConnected) {
            sendHumanMessage(text, _file);
        } else {
            sendMessage(text, _file);
        }
    };

    const sendHumanMessage = useCallback(
        async (text: string, _file?: File) => {
            const userMsg: ChatMessage = {
                id: Date.now(),
                sender: "USER",
                content: text,
                timestamp: now(),
            };
            addMessage(userMsg);
            userSendChat.mutate(text);
        },
        [addMessage]
    );

    const sendMessage = useCallback(
        async (text: string, _file?: File) => {
            const userMsg: ChatMessage = {
                id: Date.now(),
                sender: "USER",
                content: text,
                timestamp: now(),
            };
            addMessage(userMsg);
            setIsTyping(true);

            try {
                const res = await fetch(`${import.meta.env.VITE_AGENT_API}/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "message",
                        message: text,
                        session_id: getSessionId(),
                        customer_id: isAuthenticated ? session?.id : null,
                    }),
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data: ChatResponse = await res.json();

                const agentMsg: ChatMessage = {
                    id: Date.now() + 1,
                    sender: "BOT",
                    content: data?.reply || "",
                    timestamp: now(),
                    metadata: {
                        sources: data?.sources || [],
                        escalated: data?.escalated || false,
                        products: data?.products || [],
                        order: data?.order || null,
                        form: data?.form || null,
                        quick_replies: data?.quick_replies || [],
                    },
                };

                setMessages((prev) => [...prev, agentMsg]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        sender: "BOT",
                        content: "Sorry, I couldn't connect. Please try again.",
                        timestamp: now(),
                    },
                ]);
            } finally {
                setLoading(false);
                setIsTyping(false);
            }
        },
        [addMessage]
    );

    const sendFormSubmission = useCallback(async (formType: string, formData: any) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_AGENT_API}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "form_submission",
                    form_type: formType,
                    data: formData,
                    session_id: getSessionId(),
                    customer_id: isAuthenticated ? session?.id : null,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: ChatResponse = await res.json();
            const agentMsg: ChatMessage = {
                id: Date.now() + 1,
                sender: "BOT",
                content: data?.reply || "",
                timestamp: now(),
                metadata: {
                    sources: data?.sources || [],
                    escalated: data?.escalated || false,
                    products: data?.products || [],
                    form: data?.form || null,
                    quick_replies: data?.quick_replies || [],
                },
            };
            setMessages((prev) => [...prev, agentMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    sender: "BOT",
                    content: "Sorry, I couldn't connect. Please try again.",
                    timestamp: now(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    // const reactToMessage = useCallback((id: string, reaction: "thumbs-up" | "thumbs-down") => {
    //     setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m)));
    // }, []);

    return { messages, isTyping, loading, handleSendMessage, sendMessage, sendFormSubmission, clearHistory, lastMessage: messages.at(-1), isDisabled };
};
