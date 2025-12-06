import React, { useState, useEffect } from "react";
import { useOverlayTriggerState } from "react-stately";

import ChatBotComponent from "./chat/chatbot";

import { useStoreSettings } from "@/providers/store-provider";

interface Props {}

const ChatBotWrapper: React.FC = () => {
    const { settings } = useStoreSettings();

    if (settings?.feature_chatbot != "true") {
        return null;
    }

    return <ChatBot />;
};

const WhatsAppSvg: React.FC = () => {
    return (
        <svg fill="white" focusable="false" height="45" viewBox="0 0 24 24" width="45">
            <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z" />
        </svg>
    );
};

const ChatBot: React.FC<Props> = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [hasBeenClosed, setHasBeenClosed] = useState<boolean>(true);
    const state = useOverlayTriggerState({});

    useEffect(() => {
        const savedIsOpen = localStorage.getItem("chatbotOpen") !== "false";
        const hasBeenClosedThisSession = sessionStorage.getItem("chatbotClosed") === "true";

        setHasBeenClosed(hasBeenClosedThisSession);
        setIsOpen(savedIsOpen);
    }, []);

    const toggleChat = () => {
        const newIsOpen = !isOpen;

        setIsOpen(newIsOpen);

        if (!newIsOpen) {
            setHasBeenClosed(true);
            sessionStorage.setItem("chatbotClosed", "true");
        }

        localStorage.setItem("chatbotOpen", newIsOpen.toString());
    };

    const minimize = () => {
        state.close();
        setIsOpen(false);
        localStorage.setItem("chatbotOpen", "false");
    };

    if (hasBeenClosed) {
        return null;
    }

    return (
        <div>
            {!isOpen && (
                <div className="fixed right-2 bottom-20 md:bottom-6 z-50 px-2">
                    <button
                        aria-label="assistant"
                        className="data-[open=true]:hidden bg-[#25D366] hover:bg-[#128C7E] rounded-full text-white duration-300 transition-all p-2 shadow-lg"
                        data-open={isOpen ? "true" : "false"}
                        type="button"
                        onClick={toggleChat}
                    >
                        <WhatsAppSvg />
                    </button>
                </div>
            )}
            <div className="fixed right-0 bottom-0 md:bottom-4 z-50">{isOpen && <ChatBotComponent onClose={toggleChat} onMinimize={minimize} />}</div>
        </div>
    );
};

export default ChatBotWrapper;
