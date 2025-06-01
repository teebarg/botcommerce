import React from "react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    text: string;
    isUser: boolean;
}

const bubbleStyles = {
    sent: "bg-[#075e54] text-white rounded-t-xl rounded-bl-xl",
    received: "bg-[#2a393f] text-[#e6e6e6] rounded-t-xl rounded-br-xl",
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ text, isUser }) => (
    <div className={cn("max-w-[80%] px-3 py-2 my-1 shadow-md animate-fade-in", isUser ? bubbleStyles.sent : bubbleStyles.received)}>
        <div className="text-sm chatbot-message">{isUser ? text : <ReactMarkdown>{text}</ReactMarkdown>}</div>
    </div>
);

export default MessageBubble;
