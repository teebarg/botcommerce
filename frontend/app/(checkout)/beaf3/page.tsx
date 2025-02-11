"use client";

import { Send, XMark } from "nui-react-icons";
import { useState } from "react";
// import { X, RotateCw, Send, Mic } from "lucide-react";

export default function ChatInterface() {
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm the Virtual Cloud Assistant, an automated support tool here to assist you with your questions. Ask me a question, or type 'help' for additional information.",
            isBot: true,
        },
        {
            text: "Hi",
            isBot: false,
        },
        {
            text: "Hi, I'm ready to assist you. Please enter your question about IBM Cloud.",
            isBot: true,
        },
    ]);

    return (
        <div className="flex flex-col h-screen bg-zinc-900 text-white">
            <div className="w-full max-w-md h-[600px] bg-gray-900 rounded-lg shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-zinc-800 border-b border-zinc-700">
                    <h1 className="text-xl">Virtual Cloud Assistant</h1>
                    <div className="flex gap-4">
                        <button className="hover:bg-zinc-700 p-2 rounded-full">{/* <RotateCw size={20} /> */}x</button>
                        <button className="hover:bg-zinc-700 p-2 rounded-full">
                            <XMark size={20} />
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.isBot ? "" : "justify-end"}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${message.isBot ? "bg-zinc-800 text-gray-200" : "bg-blue-600 text-white"}`}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-700 bg-zinc-800">
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-zinc-700 rounded-full">{/* <Mic size={20} /> */}Mic</button>
                        <input
                            type="text"
                            placeholder="Enter your response (English only)"
                            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-400"
                        />
                        <button className="bg-blue-600 p-2 rounded-full hover:bg-blue-700">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
