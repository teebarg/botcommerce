import type React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/utils";

interface MessageBubbleProps {
    text: string;
    isUser: boolean;
}

const bubbleStyles = {
    sent: "bg-[#075e54] text-white rounded-t-xl rounded-bl-xl",
    received: "bg-[#2a393f] text-[#e6e6e6] rounded-t-xl rounded-br-xl",
};

function cleanMarkdown(md: string) {
    return md
        .replace(/\t/g, "") // Remove tabs
        .replace(/[ ]{2,}/g, " ") // Extra spaces
        .trim();

    // return md
    // //   .replace(/\t/g, '')
    //   .replace(/[ ]{2,}/g, ' ')
    // //   .trim();
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ text, isUser }) => (
    <div className={cn("max-w-[90%] px-3 py-2 my-1 shadow-md animate-fade-in", isUser ? bubbleStyles.sent : bubbleStyles.received)}>
        <div className="text-sm chatbot-message">{isUser ? text : <ReactMarkdown>{cleanMarkdown(text)}</ReactMarkdown>}</div>
    </div>
);

export default MessageBubble;
