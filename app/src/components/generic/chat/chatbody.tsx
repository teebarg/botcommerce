import type React from "react";
import { useRef, useEffect } from "react";
import MessageBubble from "./message-bubble";
import { formatDate, cn } from "@/utils";

interface Message {
    text: string;
    isUser: boolean;
}

const TypingIndicator = () => (
    <div className="flex gap-2 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
);

interface Props {
    messages: Message[];
    isLoading: boolean;
}

const ChatBody: React.FC<Props> = ({ messages, isLoading }) => {
    const bodyRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto px-2 py-4 bg-[url('/lovable-uploads/9be25808-c15d-4ce9-8d85-aad098c3ba62.png')] bg-cover"
            style={{
                backgroundColor: "#111b21",
                backgroundBlendMode: "multiply",
            }}
        >
            {/* Date */}
            <p className={cn("text-sm my-3 mx-0 text-center uppercase min-h-4 leading-6 font-medium text-white")}>
                {formatDate(new Date().toISOString())}
            </p>
            {messages.map((msg: Message, idx: number) => (
                <div key={idx} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                    <MessageBubble {...msg} />
                </div>
            ))}
            {isLoading && <TypingIndicator />}
            {/* Invisible element for scrolling */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatBody;
