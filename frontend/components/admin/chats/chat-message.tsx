import React, { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/models";
import { formatDate } from "@/lib/util/util";

interface ChatMessageProps {
    message: ChatMessage;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={cn(
                "message-container flex items-start gap-3 py-2",
                message.sender === "USER" ? "justify-end" : "justify-start",
                visible && "visible animate-fade-in"
            )}
        >
            {message.sender === "BOT" && (
                <Avatar className="h-8 w-8">
                    <AvatarImage alt="AI" src="/placeholder.jpg" />
                    <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
                </Avatar>
            )}

            <div
                className={cn(
                    "px-4 py-2 rounded-lg max-w-[90%] md:max-w-[70%] text-white",
                    message.sender === "USER" ? "bg-indigo-600 rounded-br-none" : "bg-indigo-500 rounded-bl-none"
                )}
            >
                {message.content.split("\n").map((text: string, idx: number) => (
                    <React.Fragment key={idx}>
                        {text}
                        {idx !== message.content.split("\n").length - 1 && <br />}
                    </React.Fragment>
                ))}

                <div className="text-xs opacity-70 mt-1">{formatDate(message.timestamp)}</div>
            </div>

            {message.sender === "USER" && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-orange-700 text-white text-xs">You</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
};
