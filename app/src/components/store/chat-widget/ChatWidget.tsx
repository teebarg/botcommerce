import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { TypingIndicator } from "./TypingIndicator";
import { QuickReplies } from "./QuickReplies";
import { useSupportChat } from "./useSupportChat";
import { ChatMessageBubble } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatWidgetProps {
    embedded?: boolean;
}

export const ChatWidget = ({ embedded = false }: ChatWidgetProps) => {
    const { messages, isTyping, sendMessage, reactToMessage } = useSupportChat();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, isTyping]);

    // Find the last quick-replies message
    const lastQuickReplies = [...messages].reverse().find((m) => m.contentType === "quick-replies");

    return (
        <div className={embedded ? "flex flex-col h-full" : "flex flex-col h-full"}>
            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar py-4 space-y-3">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) =>
                        msg.contentType === "quick-replies" ? null : <ChatMessageBubble key={msg.id} message={msg} onReact={reactToMessage} />
                    )}
                </AnimatePresence>

                {isTyping && <TypingIndicator />}

                {/* Show latest quick replies at the bottom */}
                {!isTyping && lastQuickReplies?.quickReplies && (
                    <QuickReplies replies={lastQuickReplies.quickReplies} onSelect={(r) => sendMessage(r)} />
                )}
            </div>

            <ChatInput onSend={sendMessage} disabled={isTyping} />
        </div>
    );
};
