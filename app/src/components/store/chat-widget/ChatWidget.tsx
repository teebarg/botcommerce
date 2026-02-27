import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { ChatInput } from "./ChatInput";
import { QuickReplies } from "./QuickReplies";
import { useSupportChat } from "./useSupportChat";
import TypingIndicator from "./TypingIndicator";
import ChatMessage from "./ChatMessage";

export const ChatWidget = () => {
    const { messages, isTyping, sendMessage, reactToMessage, clearHistory } = useSupportChat();
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasHistory = messages.length > 2; // more than just welcome messages

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, isTyping]);

    return (
        <>
            {hasHistory && (
                <div className="flex justify-end px-4 pt-3">
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear history
                    </button>
                </div>
            )}
            <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar py-4 space-y-3">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, index) => (
                        <ChatMessage key={msg.id} message={msg} index={index} />
                    ))}
                </AnimatePresence>

                {isTyping && <TypingIndicator />}

                {/* Show latest quick replies at the bottom */}
                {!isTyping && messages.at(-1)?.quick_replies && (
                    <QuickReplies replies={messages.at(-1)!.quick_replies || []} onSelect={(r) => sendMessage(r)} />
                )}
            </div>

            <ChatInput onSend={sendMessage} disabled={isTyping} />
        </>
    );
};
