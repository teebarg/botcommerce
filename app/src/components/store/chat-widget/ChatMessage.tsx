import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Headphones } from "lucide-react";
import { ChatMessage as ChatMessageType } from "./types";
import { OrderCard } from "./OrderCard";
import { ProductRecommendationCard } from "./ProductRecommendationCard";
import { cn } from "@/utils";

interface Props {
    message: ChatMessageType;
    onReact: (id: string, reaction: "thumbs-up" | "thumbs-down") => void;
}

export const ChatMessageBubble = ({ message, onReact }: Props) => {
    const isUser = message.role === "user";
    const isSystem = message.role === "system";

    if (isSystem) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center px-4 py-1">
                <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{message.content}</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn("flex gap-2.5 px-4", isUser ? "flex-row-reverse" : "flex-row")}
        >
            {/* Avatar */}
            {!isUser && (
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-bold text-primary-foreground">AI</span>
                </div>
            )}

            <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
                {/* Text bubble */}
                {message.content && (
                    <div
                        className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            isUser ? "gradient-primary text-primary-foreground rounded-tr-sm" : "glass rounded-tl-sm text-foreground"
                        )}
                    >
                        {message.content}
                    </div>
                )}

                {/* Order card */}
                {message.contentType === "order-card" && message.order && <OrderCard order={message.order} />}

                {/* Product recommendations */}
                {message.contentType === "product-card" && message.products && <ProductRecommendationCard products={message.products} />}

                {/* Escalation card */}
                {message.contentType === "escalation" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-4 space-y-3 max-w-xs"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                <Headphones className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Connect to human agent</p>
                                <p className="text-xs text-muted-foreground">Avg. wait: ~2 min</p>
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-2 rounded-xl border border-accent/40 text-sm text-accent font-medium hover:bg-accent/10 transition-colors"
                        >
                            Request Live Agent
                        </motion.button>
                    </motion.div>
                )}

                {/* Reactions + timestamp */}
                {!isUser && message.contentType !== "quick-replies" && (
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => onReact(message.id, "thumbs-up")}
                                className={cn(
                                    "p-1 rounded-md hover:bg-muted transition-colors",
                                    message.reaction === "thumbs-up" && "bg-primary/20 text-primary"
                                )}
                            >
                                <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => onReact(message.id, "thumbs-down")}
                                className={cn(
                                    "p-1 rounded-md hover:bg-muted transition-colors",
                                    message.reaction === "thumbs-down" && "bg-destructive/20 text-destructive"
                                )}
                            >
                                <ThumbsDown className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                {isUser && (
                    <span className="text-[10px] text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                )}
            </div>
        </motion.div>
    );
};
