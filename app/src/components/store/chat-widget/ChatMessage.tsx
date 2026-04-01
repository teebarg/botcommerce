import { motion } from "framer-motion";
import { Bot, User, AlertTriangle, Check, X, ShieldCheck } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/schemas";
import { ProductRecommendationCard } from "./ProductRecommendationCard";
import { formatTime } from "@/utils";
import EscalationForm from "./EscalationForm";
import { useState } from "react";
import { OrderCard } from "./OrderCard";
import ComplaintForm from "./ComplaintForm";

const EscalationCard = () => (
    <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div>
            <p className="text-xs font-semibold text-foreground">Escalated to Human Agent</p>
            <p className="text-[10px] text-muted-foreground">Average wait time: ~2 minutes</p>
        </div>
    </div>
);

function SourceBadges({ sources }: { sources: string[] }) {
    if (!sources?.length) return null;
    const icons: Record<string, string> = {
        Products: "🛍️",
        Faqs: "❓",
        Policies: "📋",
    };
    return (
        <div className="flex gap-1.5 flex-wrap mt-2">
            {sources.map((s) => (
                <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium tracking-wide"
                >
                    {icons[s] ?? "📄"} {s}
                </span>
            ))}
        </div>
    );
}

function renderText(text: string): React.ReactNode {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
            return (
                <strong key={i} className="font-semibold">
                    {part.slice(2, -2)}
                </strong>
            );
        return part.split("\n").map((line, j, arr) => (
            <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
            </span>
        ));
    });
}

interface ChatMessageProps {
    onSend: (message: string, file?: File) => void;
    onSubmitForm: (formType: string, formData: any) => void;
    message: ChatMessageType;
    index: number;
    isLastUserMessage: boolean;
    isLastMessage: boolean;
}

const ChatMessage = ({ message, index, onSend, onSubmitForm, isLastUserMessage, isLastMessage }: ChatMessageProps) => {
    const isAgent = message.sender === "BOT";
    // const isSupport = message.role === "support";
    const isAssistant = ["SUPPORT", "BOT"].includes(message.sender);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(message.content);

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
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
            className={`flex gap-2 px-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}
        >
            {isAssistant && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    {!isAgent ? <ShieldCheck  className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-primary" />}
                </div>
            )}

            <div className={`max-w-[80%] space-y-1.5 ${isAssistant ? "" : "order-first"}`}>
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
                                        ? "bg-card text-card-foreground rounded-tl-md border border-border"
                                        : "bg-primary text-primary-foreground rounded-tr-md"
                                }`}
                            >
                                {renderText(message.content)}
                            </div>
                        )}

                        {message.metadata?.escalated && <EscalationCard />}
                        {message.metadata?.order && <OrderCard order={message.metadata.order} />}
                        {message.metadata?.form?.type === "escalation_details" && <EscalationForm onSubmitForm={onSubmitForm} isLastMessage={isLastMessage} />}
                        {message.metadata?.form?.type === "complaint" && <ComplaintForm onSubmitForm={onSubmitForm} form={message.metadata.form} />}
                        {!!message.metadata?.products?.length && <ProductRecommendationCard products={message.metadata.products || []} />}
                        {isAgent && <SourceBadges sources={message.metadata?.sources ?? []} />}
                        <div className={`flex items-center gap-1.5 mt-1 ${isAgent ? "justify-start" : "justify-end"}`}>
                            <p className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</p>
                            {!isAgent && isLastUserMessage && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            {!isAssistant && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-secondary-foreground" />
                </div>
            )}
        </motion.div>
    );
};

export default ChatMessage;
