import { motion } from "framer-motion";
import { Bot, User, AlertTriangle } from "lucide-react";
import { ChatMessage as ChatMessageType } from "./types";
import { ProductRecommendationCard } from "./ProductRecommendationCard";
import { formatTime } from "@/utils";

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

const ChatMessage = ({ message, index }: { message: ChatMessageType; index: number }) => {
    const isAgent = message.role === "agent";
    if (message.text !== undefined && message.text !== null && message.text.trim() === "") {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
            className={`flex gap-2 px-2.5 ${isAgent ? "justify-start" : "justify-end"}`}
        >
            {isAgent && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                </div>
            )}

            <div className={`max-w-[80%] space-y-2 ${isAgent ? "" : "order-first"}`}>
                {message.text && (
                    <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            isAgent
                                ? "bg-card text-card-foreground rounded-tl-md border border-border"
                                : "bg-primary text-primary-foreground rounded-tr-md"
                        }`}
                    >
                        {renderText(message.text)}
                    </div>
                )}

                {message.escalated && <EscalationCard />}
                {!!message.products?.length && <ProductRecommendationCard products={message.products || []} />}
                {isAgent && <SourceBadges sources={message.sources ?? []} />}

                <p className={`text-[10px] text-muted-foreground ${isAgent ? "text-left" : "text-right"}`}>{formatTime(message.timestamp)}</p>
            </div>

            {!isAgent && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-secondary-foreground" />
                </div>
            )}
        </motion.div>
    );
};

export default ChatMessage;
