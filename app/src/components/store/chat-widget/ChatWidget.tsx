import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { QuickReplies } from "./QuickReplies";
import { useSupportChat } from "./useSupportChat";
import TypingIndicator from "./TypingIndicator";
import ChatMessage from "./ChatMessage";
import { ChatInput } from "@/utils/reuseable";

export const ChatWidget = () => {
    const { messages, isTyping, handleSendMessage, sendFormSubmission, clearHistory, isDisabled, lastUserMessage } = useSupportChat();
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasHistory = messages.length > 2;

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, isTyping]);

    return (
        <>
            {hasHistory && (
                <div className="flex justify-end px-4 py-2.5">
                    <button onClick={clearHistory} className="flex items-center gap-1.5 text-xs text-destructive cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear history
                    </button>
                </div>
            )}
            <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar py-4 space-y-3">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, index) => {
                        const isEditable = msg.content !== "User provided response" && msg.id === lastUserMessage?.id;
                        return (
                            <ChatMessage
                                key={msg.id}
                                message={msg}
                                index={index}
                                isLastMessage={index === messages.length - 1}
                                isEditable={isEditable}
                                onSend={handleSendMessage}
                                onSubmitForm={sendFormSubmission}
                            />
                        );
                    })}
                </AnimatePresence>

                {isTyping && <TypingIndicator />}

                {!isTyping && messages.at(-1)?.metadata?.quick_replies && (
                    <QuickReplies replies={messages.at(-1)?.metadata?.quick_replies || []} onSelect={(r) => handleSendMessage(r)} />
                )}
            </div>

            <ChatInput onSend={handleSendMessage} disabled={isTyping || isDisabled} />
        </>
    );
};
