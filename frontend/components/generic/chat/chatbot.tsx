"use client";

import React, { useState, useEffect } from "react";
import { Send, Paperclip, Minus, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import ChatBody from "./chatbody";

import { api } from "@/apis/client";
import { ChatMessage, Conversation } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";

interface Message {
    text: string;
    isUser: boolean;
}

interface ChatBotProps {
    onClose: () => void;
    onMinimize: () => void;
}

const ChatBotComponent: React.FC<ChatBotProps> = ({ onClose, onMinimize }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "Hello! I’m the Virtual Assistant, an automated support tool here to assist you with your questions. Ask me a question, or type 'help' for additional information.",
            isUser: false,
        },
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");

    const [conversationId, setConversationId] = useState<string | null>(null);

    useEffect(() => {
        const conversationId = sessionStorage.getItem("chatbotConversationId");

        if (conversationId) {
            setConversationId(conversationId);
            getMessages(conversationId);

            return;
        }

        createConversation();
    }, []);

    const createConversation = async () => {
        const { data, error } = await tryCatch<Conversation>(api.post("/conversation/conversations"));

        if (error || !data?.conversation_uuid) {
            toast.error("Failed to start a new conversation.");

            return;
        }

        sessionStorage.setItem("chatbotConversationId", data.conversation_uuid);
        setConversationId(data.conversation_uuid);
    };

    const getMessages = async (id: string) => {
        const { data, error } = await tryCatch<ChatMessage[]>(api.get(`/conversation/conversations/${id}/messages`));

        if (error) {
            toast.error("Failed to fetch messages.");

            return;
        }

        setMessages((prev) => [
            ...prev,
            ...(data?.map((message: ChatMessage) => ({
                text: message.content,
                isUser: message.sender === "USER",
            })) ?? []),
        ]);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (!conversationId) {
            await createConversation();
        }

        setIsLoading(true);
        setMessages([...messages, { text: input, isUser: true }]);
        setInput("");

        const { data, error } = await tryCatch<ChatMessage>(api.post(`/conversation/conversations/${conversationId}/messages`, { content: input }));

        if (error) {
            toast.error(error);
            setIsLoading(false);

            return;
        }

        setMessages((prev) => [...prev, { text: data?.content || "", isUser: false }]);
        setIsLoading(false);
    };

    return (
        <div className="w-full md:max-w-md flex flex-col h-[90vh] rounded-xl rounded-b-none md:rounded-b-xl shadow-2xl animate-fade-in z-70">
            <header className="flex items-center px-4 py-3 bg-[#222d31] rounded-t-xl border-b border-[#232930]">
                <Image
                    alt="AI Assistant"
                    blurDataURL="/placeholder.jpg"
                    className="rounded-full mr-4"
                    height={40}
                    placeholder="blur"
                    priority={false}
                    src="/profile-1.jpeg"
                    width={40}
                />
                <div className="flex-1">
                    <div className="font-semibold text-white text-base">Online Assistant</div>
                    <div className="text-xs text-[#b2b8bd]">Online</div>
                </div>
                <div className="flex gap-3">
                    <button aria-label="Minimize chat" className="p-1.5 rounded-full hover:bg-[#2a393f] transition" onClick={onMinimize}>
                        <Minus color="#b2b8bd" size={20} />
                    </button>
                    <button aria-label="Close chat" className="p-1.5 rounded-full hover:bg-[#2a393f] transition" onClick={onClose}>
                        <X color="#b2b8bd" size={20} />
                    </button>
                </div>
            </header>
            <ChatBody isLoading={isLoading} messages={messages} />
            <form className="flex items-center px-3 py-2 bg-[#222d31] rounded-b-none md:rounded-b-xl border-t border-[#232930]" onSubmit={handleSend}>
                <button aria-label="Attach file" className="p-2 rounded-full hover:bg-[#2a393f] transition" tabIndex={-1} type="button">
                    <Paperclip color="#b2b8bd" size={20} />
                </button>
                <input
                    className="flex-1 bg-transparent outline-none px-3 py-2 text-[#e6e6e6] placeholder-gray-400"
                    placeholder="Type a message"
                    style={{ fontSize: "15px" }}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button aria-label="Send" className="p-2 bg-[#075e54] rounded-full hover:bg-[#128c7e] transition" type="submit">
                    <Send color="#fff" size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatBotComponent;
