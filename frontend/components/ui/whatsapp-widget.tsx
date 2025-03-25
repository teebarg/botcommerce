"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { formatDate } from "@/lib/util/util";
import { siteConfig } from "@/lib/config";

const WhatsAppWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedMessage}`, "_blank");
        setMessage("");
        setIsOpen(false);
    };

    return (
        <>
            {/* WhatsApp Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 md:right-12 bg-[#25D366] rounded-full p-2 shadow-lg hover:bg-[#128C7E] transition-colors z-50 text-white"
            >
                <svg fill="white" focusable="false" viewBox="0 0 24 24" width="45" height="45">
                    <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"></path>
                </svg>
            </button>

            {/* Chat Widget */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[350px] bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#075E54] p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#075E54">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" />
                                </svg>
                            </div>
                            <div className="text-white">
                                <h3 className="font-semibold text-lg">{siteConfig.name}</h3>
                                <p className="text-sm opacity-90">Typically replies within 10 minutes</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-80">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Chat Content */}
                    <div className="p-4 bg-[#E5DDD5]">
                        <div className="bg-white rounded-lg p-3 inline-block max-w-[80%]">
                            <p className="text-gray-800">Hi, welcome to {siteConfig.name}, how can we help you today 😊</p>
                            <p className="text-xs text-gray-500 text-right mt-1">{formatDate(new Date())}</p>
                        </div>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message.."
                                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-[#075E54]"
                            />
                            <Button type="submit" className="bg-[#075E54] hover:bg-[#128C7E] rounded-full px-6">
                                Send
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default WhatsAppWidget;
