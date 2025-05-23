"use client";

import { cn } from "@lib/util/cn";
import React, { useState, useEffect, useRef } from "react";
import { Minus, Send, Smiley, X } from "nui-react-icons";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import { useStore } from "@/app/store/use-store";
import { api } from "@/apis/base";
import { ChatMessage, Conversation } from "@/types/models";
import { formatDate } from "@/lib/util/util";

interface Props {}

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

const ChatBotWrapper: React.FC = () => {
    const { shopSettings } = useStore();

    if (shopSettings?.feature_chatbot != "true") {
        return null;
    }

    return <ChatBot />;
};

const ChatBot: React.FC<Props> = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "Hello! I’m the Virtual Assistant, an automated support tool here to assist you with your questions. Ask me a question, or type 'help' for additional information.",
            isUser: false,
        },
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [hasBeenClosed, setHasBeenClosed] = useState<boolean>(true);

    const [conversationId, setConversationId] = useState<string | null>(null);

    useEffect(() => {
        const conversationId = sessionStorage.getItem("chatbotConversationId");

        if (conversationId) {
            setConversationId(conversationId);
            getMessages(conversationId);

            return;
        }

        const createConversation = async () => {
            const { data, error } = await api.post<Conversation>("/conversation/conversations");

            if (error || !data?.conversation_uuid) {
                toast.error("Failed to start a new conversation.");

                return;
            }

            sessionStorage.setItem("chatbotConversationId", data.conversation_uuid);
            setConversationId(data.conversation_uuid);
        };

        createConversation();
    }, []);

    useEffect(() => {
        // Set isOpen after hydration
        const savedIsOpen = localStorage.getItem("chatbotOpen") !== "false";

        setIsOpen(savedIsOpen);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Replace the existing auto-open useEffect
    useEffect(() => {
        const hasBeenClosedThisSession = sessionStorage.getItem("chatbotClosed") === "true";

        setHasBeenClosed(hasBeenClosedThisSession);

        // if (!hasBeenClosedThisSession) {
        //     const timer = setTimeout(() => {
        //         setIsOpen(true);
        //         localStorage.setItem("chatbotOpen", "true");
        //     }, 2000);

        //     return () => clearTimeout(timer);
        // }
    }, []); // Empty dependency array means this runs once on mount

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getMessages = async (id: string) => {
        const { data, error } = await api.get<ChatMessage[]>(`/conversation/conversations/${id}/messages`);

        if (error || !data) {
            toast.error("Failed to fetch messages.");

            return;
        }

        setMessages((prev) => [
            ...prev,
            ...data.map((message: ChatMessage) => ({
                text: message.content,
                isUser: message.sender === "USER",
            })),
        ]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setMessages([...messages, { text: input, isUser: true }]);
        setInput("");

        const { data, error } = await api.post<ChatMessage>(`/conversation/conversations/${conversationId}/messages`, { content: input });

        if (error) {
            toast.error(error);
            setIsLoading(false);

            return;
        }

        setMessages((prev) => [...prev, { text: data?.content || "", isUser: false }]);
        setIsLoading(false);
    };

    const toggleChat = () => {
        const newIsOpen = !isOpen;

        setIsOpen(newIsOpen);

        if (!newIsOpen) {
            setHasBeenClosed(true);
            sessionStorage.setItem("chatbotClosed", "true");
        }

        localStorage.setItem("chatbotOpen", newIsOpen.toString());
    };

    const minimize = () => {
        setIsOpen(false);
        localStorage.setItem("chatbotOpen", "false");
    };

    if (hasBeenClosed) {
        return null;
    }

    return (
        <React.Fragment>
            <div className="fixed right-2 md:right-6 bottom-6 z-[500]">
                <div
                    className="max-w-md w-[calc(100%-8px)] ml-2 sm:ml-auto sm:w-[400px] h-[700px] bg-gray-900 rounded-lg shadow-xl hidden data-[open=true]:flex flex-col"
                    data-open={isOpen ? "true" : "false"}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                        <h1 className="text-white text-lg font-semibold">Virtual Assistant</h1>
                        <div className="flex items-center gap-4">
                            <button aria-label="minimize chat" className="text-gray-400 hover:text-white transition" onClick={minimize}>
                                <Minus className="w-5 h-5" />
                            </button>
                            <button aria-label="close chat" className="text-gray-400 hover:text-white transition" onClick={toggleChat}>
                                {" "}
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Date */}
                        <p className={cn("text-sm my-3 mx-0 text-center uppercase min-h-4 leading-6 font-medium text-white")}>
                            {formatDate(new Date().toISOString())}
                        </p>
                        {messages.map((message: Message, index: number) => (
                            <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 chatbot-message ${
                                        message.isUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-800 text-gray-200 rounded-bl-none"
                                    }`}
                                >
                                    <div className="text-sm">{message.isUser ? message.text : <ReactMarkdown>{message.text}</ReactMarkdown>}</div>
                                </div>
                            </div>
                        ))}
                        {/* Typing Indicator */}
                        {isLoading && <TypingIndicator />}
                        {/* Invisible element for scrolling */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                            <button aria-label="smiley" className="p-2 hover:bg-zinc-700 rounded-full">
                                <Smiley />
                            </button>
                            <input
                                className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-400"
                                placeholder="Enter your response (English only)"
                                type="text"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                            />
                            <button
                                className="p-2 text-blue-700 hover:text-blue-400 transition disabled:opacity-50"
                                disabled={!input.trim()}
                                onClick={handleSend}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="block data-[open=true]:hidden" data-open={isOpen ? "true" : "false"}>
                    <button
                        aria-label="assistant"
                        className="group bg-[#0f62fe] text-white min-w-12 place-items-center flex duration-300 transition-all py-2 px-4"
                        type="button"
                        onClick={toggleChat}
                        onMouseEnter={(e) => e.currentTarget.setAttribute("data-hover", "true")}
                        onMouseLeave={(e) => e.currentTarget.removeAttribute("data-hover")}
                    >
                        <svg
                            aria-hidden="true"
                            aria-label="Click to open"
                            fill="currentColor"
                            focusable="false"
                            height="32"
                            role="img"
                            viewBox="0 0 32 32"
                            width="32"
                        >
                            <path d="M16 19a6.9908 6.9908 0 01-5.833-3.1287l1.666-1.1074a5.0007 5.0007 0 008.334 0l1.666 1.1074A6.9908 6.9908 0 0116 19zM20 8a2 2 0 102 2A1.9806 1.9806 0 0020 8zM12 8a2 2 0 102 2A1.9806 1.9806 0 0012 8z" />
                            <path d="M17.7358,30,16,29l4-7h6a1.9966,1.9966,0,0,0,2-2V6a1.9966,1.9966,0,0,0-2-2H6A1.9966,1.9966,0,0,0,4,6V20a1.9966,1.9966,0,0,0,2,2h9v2H6a3.9993,3.9993,0,0,1-4-4V6A3.9988,3.9988,0,0,1,6,2H26a3.9988,3.9988,0,0,1,4,4V20a3.9993,3.9993,0,0,1-4,4H21.1646Z" />
                        </svg>
                        <span className="ml-2 hidden group-data-[hover=true]:block">Virtual assistant</span>
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ChatBotWrapper;
