import type React from "react";
import { Mail } from "lucide-react";
import type { Chat, ChatMessage, ConversationStatus } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import AdminChatMessage from "./chat-message";
import { useAdminMessageMutation, useChatHandOff } from "@/hooks/useApi";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "pulsews";
import { chatAvatar, ChatInput } from "@/utils/reuseable";

const StatusBadge = ({ status }: { status: ConversationStatus }) => {
    const labels = {
        ["ABANDONED"]: "Abandoned",
        ["ACTIVE"]: "Open",
        ["COMPLETED"]: "Completed",
    };

    const variants: Record<ConversationStatus, "destructive" | "emerald" | "warning"> = {
        ["ABANDONED"]: "destructive",
        ["ACTIVE"]: "emerald",
        ["COMPLETED"]: "warning",
    };

    return <Badge variant={variants[status ?? "ABANDONED"]}>{labels[status]}</Badge>;
};

const ChatViewer: React.FC<{ chat: Chat; onClose: () => void }> = ({ chat, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(chat.messages);
    const scrollRef = useRef<HTMLDivElement>(null);
    const handOff = useChatHandOff();
    const send = useAdminMessageMutation();
    const { lastMessage } = useWebSocket();

    useEffect(() => {
        const agentMsg: ChatMessage = {
            id: Date.now() + 1,
            sender: "USER",
            content: lastMessage.message || "",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, agentMsg]);
    }, [lastMessage]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const addMessage = useCallback((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const handleTakeOver = () => {
        handOff.mutate({ conversationUuid: chat.conversation_uuid });
    };
    const handleSend = (message: string, file?: File) => {
        const AdminMsg: ChatMessage = {
            id: Date.now(),
            sender: "SYSTEM",
            content: message,
            timestamp: new Date(),
        };
        addMessage(AdminMsg);
        send.mutateAsync({
            conversationUuid: chat.conversation_uuid,
            message: message,
        });
    };
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between bg-background border-b border-border py-4 px-2.5">
                <div className="flex items-center gap-2">
                    {chatAvatar(chat.user?.image, "w-10 h-10")}
                    <div>
                        <h2 className="font-medium flex items-center text-sm">{chat.user?.first_name ?? "Anonymous"}</h2>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail size={14} />
                            {chat?.user?.email ?? "guest"}
                        </div>
                    </div>
                </div>
                <div className="pr-12">
                    <StatusBadge status={chat.status} />
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    return (
                        <AdminChatMessage
                            key={msg.id}
                            message={msg}
                            image={chat.user?.image || ""}
                            humanConnected={chat.human_connected || false}
                            takeOverPending={handOff.isPending}
                            onHandleTakeOver={handleTakeOver}
                        />
                    );
                })}
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <p className="text-gray-500">No messages</p>
                    </div>
                )}
            </div>
            {chat.human_connected && <ChatInput onSend={handleSend} disabled={send.isPending} />}
        </div>
    );
};

export default ChatViewer;
