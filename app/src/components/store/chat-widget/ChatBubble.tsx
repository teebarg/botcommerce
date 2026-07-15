import { useEffect, useRef, useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { ChatWidget } from "./ChatWidget";
import { useConfig } from "@/providers/store-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLocation } from "@tanstack/react-router";

const ChatHeader = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="flex items-center gap-3 px-4 pb-3 pt-[calc(var(--sat)+12px)] border-b border-border bg-card/50 shrink-0 rounded-t-2xl">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange-800" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">Support Agent</h3>
                <p className="text-2xs text-muted-foreground">AI-powered • Always online</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-foreground" />
            </button>
        </div>
    );
};

export const ChatBubble = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { isMobile } = useMediaQuery()
    const { feature_chatbot } = useConfig();
    const location = useLocation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setIsOpen(false);
    }, [location.pathname]);

    if (feature_chatbot != "true") {
        return null;
    }

    return (
        <>
            {isOpen && (
                <>
                    {isMobile ? (
                        <div className="fixed inset-0 z-[60] bg-background flex flex-col">
                            <ChatHeader onClose={() => setIsOpen(false)} />
                            <ChatWidget />
                        </div>
                    ) : (
                        <div
                            className="fixed bottom-24 right-6 z-[60] w-[400px] h-[700px] rounded-3xl border border-border bg-background shadow-2xl overflow-hidden flex flex-col"
                        >
                            <ChatHeader onClose={() => setIsOpen(false)} />
                            <ChatWidget />
                        </div>
                    )}
                </>
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed right-5 z-50 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                    style={{ boxShadow: "0 0 30px hsl(350 89% 60% / 0.4)", bottom: "calc(90px + var(--sab))" }}
                >
                    <MessageCircle className="w-6 h-6 text-primary-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive" />
                </button>
            )}
        </>
    );
};
