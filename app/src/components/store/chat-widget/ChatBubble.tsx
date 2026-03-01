import { useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatWidget } from "./ChatWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConfig } from "@/providers/store-provider";

const ChatHeader = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm shrink-0 rounded-t-2xl">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">Support Agent</h3>
                <p className="text-[11px] text-muted-foreground">AI-powered • Always online</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-foreground" />
            </button>
        </div>
    );
};

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
                                <ChatHeader onClose={() => setIsOpen(false)} />
                                <ChatWidget />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="fixed bottom-24 right-6 z-[60] w-[400px] h-[700px] rounded-3xl border border-border bg-background shadow-2xl overflow-hidden flex flex-col"
                            >
                                <ChatHeader onClose={() => setIsOpen(false)} />
                                <ChatWidget />
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center"
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
