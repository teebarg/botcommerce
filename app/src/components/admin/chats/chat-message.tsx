import { Bot, AlertTriangle, Check, X, ShieldCheck } from "lucide-react";
import { formatTime } from "@/utils";
import { useState } from "react";
import { ChatMessage } from "@/schemas";
import { Button } from "@/components/ui/button";
import { chatAvatar, renderText } from "@/utils/reuseable";

interface ChatMessageProps {
    onSend?: (message: string, file?: File) => void;
    message: ChatMessage;
    humanConnected: boolean;
    takeOverPending: boolean;
    onHandleTakeOver: () => void;
    image?: string;
}

const AdminChatMessage = ({ message, onSend, humanConnected, takeOverPending, onHandleTakeOver, image }: ChatMessageProps) => {
    const isAgent = message.sender === "BOT";
    const isAssistant = ["SYSTEM", "BOT"].includes(message.sender);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editValue, setEditValue] = useState<string>(message.content);

    const handleSaveEdit = () => {
        const trimmed = editValue.trim();
        if (!trimmed) return;
        setIsEditing(false);
        onSend?.(trimmed);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditValue(message.content);
    };
    if (message.content !== undefined && message.content !== null && message.content.trim() === "") {
        return null;
    }

    return (
        <>
            <div className={`flex gap-2 px-2.5 ${isAssistant ? "justify-end" : "justify-start"}`}>
                {!isAssistant && chatAvatar(image)}

                <div className={`max-w-[80%] space-y-1.5 ${!isAssistant ? "" : "order-first"}`}>
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSaveEdit();
                                    }
                                    if (e.key === "Escape") handleCancelEdit();
                                }}
                                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[60px]"
                                autoFocus
                            />
                            <div className="flex items-center gap-1.5 justify-end">
                                <button onClick={handleCancelEdit} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={!editValue.trim()}
                                    className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {message.content && (
                                <div
                                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                        isAssistant
                                            ? "bg-card text-card-foreground rounded-tr-none border border-border"
                                            : "bg-primary text-primary-foreground rounded-tl-none"
                                    }`}
                                >
                                    {renderText(message.content)}
                                </div>
                            )}
                            {message.metadata?.reason && (
                                <div className="mt-2 rounded-lg bg-card text-card-foreground italic p-3 text-sm">
                                    {renderText(message.metadata?.reason)}
                                </div>
                            )}
                            <div className={`flex mt-1 ${!isAssistant ? "justify-start" : "justify-end"}`}>
                                <p className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</p>
                            </div>
                        </>
                    )}
                </div>
                {isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                        {!isAgent ? <ShieldCheck className="w-4 h-4 text-orange-700" /> : <Bot className="w-4 h-4 text-orange-800" />}
                    </div>
                )}
            </div>
            {message.metadata?.escalated && (
                <div className="mx-4 mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-foreground">Escalated to Human Agent</p>
                        {!humanConnected && (
                            <Button size="xs" variant="warning" onClick={onHandleTakeOver} isLoading={takeOverPending} disabled={takeOverPending}>
                                Take over
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminChatMessage;
