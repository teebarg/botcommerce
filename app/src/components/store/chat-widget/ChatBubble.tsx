import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatWidget } from "./ChatWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConfig } from "@/providers/store-provider";

export const ChatBubble = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const isMobile = useIsMobile();

    const { config } = useConfig();
    if (config?.feature_chatbot != "true") {
        return null;
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {isMobile ? (
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed inset-0 z-[60] bg-background flex flex-col"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary-foreground">AI</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Support</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                                <span className="text-xs text-muted-foreground">Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                                        <X className="w-5 h-5 text-foreground" />
                                    </button>
                                </div>

                                <ChatWidget />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="fixed bottom-24 right-6 z-[60] w-[400px] h-[600px] rounded-3xl border border-border bg-background shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary-foreground">AI</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Shopping Assistant</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                                <span className="text-xs text-muted-foreground">Always online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                                        <X className="w-5 h-5 text-foreground" />
                                    </button>
                                </div>

                                <ChatWidget />
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>

            {/* Floating bubble */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-20 md:bottom-8 right-24 md:right-6p z-[55] w-14 h-14 rounded-full gradient-primary bg-green-600 shadow-lg flex items-center justify-center"
                        style={{ boxShadow: "0 0 30px hsl(350 89% 60% / 0.4)" }}
                    >
                        <MessageCircle className="w-6 h-6 text-primary-foreground" />
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-background" />
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
};
