"use client";

import { RefreshCcw, Send, XMark } from "nui-react-icons";
import React, { useState } from "react";
// import { X, RotateCcw, Send, Mic } from "lucide-react";

interface Message {
    id: number;
    text: string;
    isUser: boolean;
}

function Beaf2() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello Adeniyi! I'm the Virtual Cloud Assistant, an automated support tool here to assist you with your questions. Ask me a question, or type 'help' for additional information.",
            isUser: false,
        },
        {
            id: 2,
            text: "Hi",
            isUser: true,
        },
        {
            id: 3,
            text: "Hi Adeniyi, I'm ready to assist you. Please enter your question about IBM Cloud.",
            isUser: false,
        },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages([...messages, { id: messages.length + 1, text: newMessage, isUser: true }]);
            setNewMessage("");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md h-[600px] bg-gray-900 rounded-lg shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <h1 className="text-white text-lg font-semibold">Virtual Cloud Assistant</h1>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-white transition">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition">
                            {" "}
                            <XMark className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                    message.isUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-800 text-gray-200 rounded-bl-none"
                                }`}
                            >
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                        <button type="button" className="p-2 text-gray-400 hover:text-white transition">
                            {/* <Mic className="w-5 h-5" /> */}
                            Mic
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Enter your response (English only)"
                            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="p-2 text-blue-500 hover:text-blue-400 transition disabled:opacity-50"
                            disabled={!newMessage.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Beaf2;
