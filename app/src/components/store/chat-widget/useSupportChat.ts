import { useState, useCallback } from "react";
import { ChatMessage } from "./types";

const generateId = () => Math.random().toString(36).slice(2, 10);

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: generateId(),
        role: "agent",
        content: "Hey there! 👋 I'm your personal shopping assistant. How can I help you today?",
        contentType: "text",
        timestamp: new Date(),
    },
    {
        id: generateId(),
        role: "agent",
        content: "",
        contentType: "quick-replies",
        timestamp: new Date(),
        quickReplies: ["Track my order", "Product recommendations", "Return an item", "Talk to a human"],
    },
];

const mockOrderLookup = (): ChatMessage[] => [
    {
        id: generateId(),
        role: "agent",
        content: "Here's your most recent order:",
        contentType: "order-card",
        timestamp: new Date(),
        order: {
            orderId: "ORD-29481",
            status: "shipped",
            items: ["Cloud Runner Elite × 1", "Milano Leather Tote × 1"],
            total: 1539,
            estimatedDelivery: "Mar 2, 2026",
            trackingUrl: "#",
        },
    },
    {
        id: generateId(),
        role: "agent",
        content: "",
        contentType: "quick-replies",
        timestamp: new Date(),
        quickReplies: ["Where is my package?", "Change delivery address", "Something else"],
    },
];

const mockProductRecs = (): ChatMessage[] => [
    {
        id: generateId(),
        role: "agent",
        content: "Based on your browsing, you might love these:",
        contentType: "product-card",
        timestamp: new Date(),
        products: [],
    },
];

const mockEscalation = (): ChatMessage[] => [
    {
        id: generateId(),
        role: "agent",
        content: "I'll connect you with a human agent who can help further.",
        contentType: "escalation",
        timestamp: new Date(),
    },
];

const mockFAQ = (question: string): ChatMessage[] => [
    {
        id: generateId(),
        role: "agent",
        content: question.toLowerCase().includes("return")
            ? 'You can return any unused item within 30 days of delivery. Simply go to your order, click "Return Item", and follow the steps. A prepaid shipping label will be emailed to you.'
            : question.toLowerCase().includes("shipping")
              ? "We offer Standard (5-7 days), Express (2-3 days), and Same-Day delivery in select areas. Express is free on orders over $200!"
              : "I'm happy to help! Could you tell me more about what you're looking for?",
        contentType: "text",
        timestamp: new Date(),
    },
    {
        id: generateId(),
        role: "agent",
        content: "",
        contentType: "quick-replies",
        timestamp: new Date(),
        quickReplies: ["That helped, thanks!", "I need more help", "Talk to a human"],
    },
];

export const useSupportChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [isTyping, setIsTyping] = useState(false);

    const addMessage = useCallback((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const sendMessage = useCallback(
        (text: string, _file?: File) => {
            const userMsg: ChatMessage = {
                id: generateId(),
                role: "user",
                content: text || "📎 Attachment sent",
                contentType: _file ? "file" : "text",
                timestamp: new Date(),
                fileName: _file?.name,
            };
            addMessage(userMsg);
            setIsTyping(true);

            const lower = text.toLowerCase();

            setTimeout(
                () => {
                    setIsTyping(false);

                    let responses: ChatMessage[];
                    if (lower.includes("track") || lower.includes("order") || lower.includes("where")) {
                        responses = mockOrderLookup();
                    } else if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("product")) {
                        responses = mockProductRecs();
                    } else if (lower.includes("human") || lower.includes("agent") || lower.includes("talk")) {
                        responses = mockEscalation();
                    } else {
                        responses = mockFAQ(text);
                    }

                    responses.forEach((r, i) => {
                        setTimeout(() => addMessage(r), i * 300);
                    });
                },
                1200 + Math.random() * 800
            );
        },
        [addMessage]
    );

    const reactToMessage = useCallback((id: string, reaction: "thumbs-up" | "thumbs-down") => {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m)));
    }, []);

    return { messages, isTyping, sendMessage, reactToMessage };
};
