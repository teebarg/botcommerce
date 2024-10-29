"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "@modules/common/components/button";
import { ArrowUpRightMini, XMark } from "nui-react-icons";
import { useSnackbar } from "notistack";
import { Input } from "@components/ui/input";

interface Message {
    text: string;
    isUser: boolean;
}

export const Chatbot: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("chatbotOpen") !== "false";
        }

        return false;
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return; // Don't set initial messages if chat is closed

        const timer = setTimeout(() => {
            setMessages([
                { text: "Hi, welcome to our store", isUser: false },
                { text: "How can we help you today?", isUser: false },
            ]);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    };

    // Function to send message to Rasa bot and get response
    const getRasaResponse = async (message: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_RASA_URL}/webhooks/rest/webhook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: message }),
            });
            const data = await response.json();

            return data[0]?.text || "Sorry, I couldn't understand that.";
        } catch (error) {
            enqueueSnackbar("Error communicating with Rasa:", { variant: "error" });
        }
    };

    // Update handleSend function to use Rasa
    const handleSend = async () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, isUser: true }]);
            setInput("");

            // Get response from Rasa
            const botResponse = await getRasaResponse(input);

            setMessages((prev) => [...prev, { text: botResponse, isUser: false }]);
        }
    };

    const toggleChat = () => {
        const newIsOpen = !isOpen;

        setIsOpen(newIsOpen);
        localStorage.setItem("chatbotOpen", newIsOpen.toString());
    };

    return (
        <div className="fixed bottom-8 right-6 z-30">
            {isOpen ? (
                <div className="w-[90vw] sm:w-[30rem] h-[30rem] flex flex-col overflow-hidden rounded-lg bg-default-200 shadow">
                    <div className="px-4 py-5 sm:px-6 flex justify-between bg-fuchsia-400 text-white">
                        <p className="font-semibold">Botcommerce Web Chat</p>
                        <button className="" onClick={toggleChat}>
                            <XMark size={20} />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-3 px-4 py-5 sm:p-6">
                        <div className="text-center mb-4">
                            <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700 font-semibold">
                                {formatDate(new Date())}
                            </span>
                        </div>
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-2 ${message.isUser ? "text-right" : "text-left"}`}>
                                <div className={`inline-flex items-center ${message.isUser ? "flex-row-reverse" : "flex-row"}`}>
                                    {!message.isUser && (
                                        <div className="relative inline-flex shrink-0 mr-2">
                                            <span className="flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none w-10 h-10 rounded-full">
                                                <img alt="avatar" className="flex object-cover w-full h-full" src="/avatar_ai.png" />
                                            </span>
                                        </div>
                                    )}
                                    <span
                                        className={`inline-block p-2 rounded-lg ${
                                            message.isUser
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                                : "bg-gradient-to-r from-blue-400 to-cyan-300 text-black rounded-t"
                                        }`}
                                    >
                                        {message.text}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 px-4 py-4 sm:px-6">
                        <div className="flex">
                            <Input size="sm" placeholder="Type a message..." value={input} onChange={setInput} />
                            <Button className="ml-2" color="secondary" onPress={handleSend}>
                                <ArrowUpRightMini size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <button className="bg-primary text-white rounded-full h-16 w-16 p-0 flex items-center justify-center" onClick={toggleChat}>
                    <ArrowUpRightMini className="" size={20} />
                </button>
            )}
        </div>
    );
};
