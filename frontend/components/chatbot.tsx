"use client";

import { cn } from "@lib/util/cn";
import React, { useState, useEffect, useRef } from "react";
import { CogSixTooth, RefreshCcw, Send, Smiley, XMark } from "nui-react-icons";
import { useSnackbar } from "notistack";
import { VisuallyHidden } from "@react-aria/visually-hidden";

interface Props {}

interface Message {
    text: string;
    isUser: boolean;
}

const TypingIndicator = () => (
    <div className="flex gap-2 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
);

const ChatBot: React.FC<Props> = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [input, setInput] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasBeenClosed, setHasBeenClosed] = useState<boolean>(false);

    useEffect(() => {
        // Set isOpen after hydration
        const savedIsOpen = localStorage.getItem("chatbotOpen") !== "false";

        setIsOpen(savedIsOpen);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMessages([
                {
                    text: "Hello Adeniyi! I’m the Virtual Assistant, an automated support tool here to assist you with your questions. Ask me a question, or type 'help' for additional information.",
                    isUser: false,
                },
                { text: "How can we help you today?", isUser: false },
            ]);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Replace the existing auto-open useEffect
    useEffect(() => {
        const hasBeenClosedThisSession = sessionStorage.getItem("chatbotClosed") === "true";

        setHasBeenClosed(hasBeenClosedThisSession);

        // if (!hasBeenClosedThisSession) {
        //     const timer = setTimeout(() => {
        //         setIsOpen(true);
        //         localStorage.setItem("chatbotOpen", "true");
        //     }, 2000);

        //     return () => clearTimeout(timer);
        // }
    }, []); // Empty dependency array means this runs once on mount

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    };

    // Function to send message to Rasa bot and get response
    const getRasaResponse = async (message: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_RASA_URL}/webhooks/rest/webhook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: message }),
            });
            const data = await response.json();

            return data[0]?.text || "Sorry, I couldn't understand that.";
        } catch (error) {
            enqueueSnackbar("Error communicating with Rasa:", { variant: "error" });
        }
    };

    // Update handleSend function to use Rasa
    const handleSend = async () => {
        if (!input.trim()) return;
        // if (input.trim()) {
        setIsLoading(true);
        setMessages([...messages, { text: input, isUser: true }]);
        setInput("");

        // Get response from Rasa
        const botResponse = await getRasaResponse(input);

        setMessages((prev) => [...prev, { text: botResponse, isUser: false }]);
        setIsLoading(false);
        // }
    };

    const toggleChat = () => {
        const newIsOpen = !isOpen;

        setIsOpen(newIsOpen);

        // if (!newIsOpen) {
        //     setHasBeenClosed(true);
        //     sessionStorage.setItem("chatbotClosed", "true");
        // }

        localStorage.setItem("chatbotOpen", newIsOpen.toString());
    };

    if (hasBeenClosed) {
        return null;
    }

    return (
        <React.Fragment>
            <div
                className="right-0 sm:right-4 bottom-28 fixed z-40 overflow-hidden h-full max-h-[600px] w-[calc(100%-30px)] sm:w-[400px] mx-4 hidden data-[open=true]:block rounded-md"
                data-open={isOpen ? "true" : "false"}
            >
                <header className="py-2 px-3 overflow-hidden rounded-top-corners max-h-full text-white" style={{ background: "rgb(255, 90, 45)" }}>
                    <div aria-hidden="false" className="flex items-center">
                        <div className="inline-block align-middle relative rounded-50">
                            <div className="rounded-50 overflow-hidden bg-transparent">
                                <div
                                    className="w-8 h-8 shadow-none rounded-50 overflow-hidden border-2 border-solid border-white bg-cover"
                                    style={{ backgroundImage: "url(/bot.svg)", backgroundPosition: "50%" }}
                                />
                            </div>
                            <svg
                                aria-hidden="true"
                                className="rounded-md outline-0 align-middle h-2.5 w-2.5 absolute right-0 bottom-0 border-2 border-solid border-white"
                                role="img"
                                style={{ strokeWidth: 8 }}
                                viewBox="0 0 20 20"
                            >
                                <circle cx="10" cy="10" r="9" />
                            </svg>
                        </div>
                        <span
                            className="text-white ml-2 py-[1px] text-sm leading-3 inline-block align-middle relative"
                            style={{ color: "rgb(255, 255, 255)" }}
                        >
                            Max
                        </span>
                    </div>
                </header>
                <div className="h-[calc(100%-48px)] list-none m-0 p-0 overflow-hidden relative">
                    <div className="bottom-3 flex flex-col absolute inset-0 overflow-scroll mr-0 mb-0 pb-12 bg-default h-full w-full">
                        <div aria-label="Messages from the conversation" className="flex flex-col gap-4">
                            {messages?.map((message, index) => (
                                <div key={index} className="relative py-0 px-4 flex flex-col">
                                    {index == 0 && (
                                        <p className={cn("text-sm my-3 mx-0 text-center uppercase min-h-4 leading-6 font-medium")}>
                                            {formatDate(new Date())}
                                        </p>
                                    )}

                                    <ul
                                        className={cn("list-none relative clear-both", message.isUser ? "pr-4" : "py-0 pl-10 pr-0")}
                                        style={{ margin: "16px 0 0" }}
                                    >
                                        {!message.isUser && (
                                            <React.Fragment>
                                                <li className="mt-0">
                                                    <span className="text-sm ml-1 align-top" style={{ color: "rgb(53, 63, 69)" }}>
                                                        Max
                                                    </span>
                                                </li>
                                                <li className="bottom-1 absolute left-0">
                                                    <div className="rounded-50 overflow-hidden bg-transparent">
                                                        <div
                                                            className="w-7 h-7 rounded-50 overflow-hidden border-2 border-white border-solid bg-cover"
                                                            style={{ backgroundImage: "url(/bot.svg)", backgroundPosition: "50%" }}
                                                        />
                                                    </div>
                                                </li>
                                            </React.Fragment>
                                        )}
                                        <li
                                            className={cn(
                                                "clear-both max-w-[calc(100%-48px)] w-auto relative my-0.5 mx-0 min-h-9",
                                                message.isUser ? "float-right" : "float-left"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "relative rounded-xl py-2 px-3 text-sm leading-5 inline-block",
                                                    message.isUser
                                                        ? "bg-orange-700 text-white overflow-hidden max-w-[calc(100%-8px)] float-right"
                                                        : "bg-content2 text-default-900 overflow-visible max-w-[calc(100%-16px)] float-left"
                                                )}
                                            >
                                                <span className="m-0 max-w-full">
                                                    <p>{message.text}</p>
                                                </span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 w-full leading-4 bg-default" style={{ borderRadius: "0 0 5px 5px", padding: "0 16px 13px" }}>
                    <div className="py-[3px] px-0 relative flex items-center w-full">
                        <div className="flex max-h-20 overflow-hidden relative flex-1 chatinput-wrapper">
                            <pre> </pre>
                            <VisuallyHidden>
                                <label htmlFor="chat-input">Write a reply...</label>
                            </VisuallyHidden>

                            <textarea
                                aria-label="Write a reply..."
                                className="placeholder:text-ellipsis text-default-900 border-default-500 focus-visible:outline-none border-solid border resize-none absolute"
                                id="chat-input"
                                placeholder="Write a reply..."
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                            />
                            <button
                                aria-expanded="false"
                                aria-label="open emoji picker"
                                className="absolute bottom-2 right-3 border-none m-0 p-0 cursor-pointer text-center align-top inline-block h-6 w-6"
                            >
                                <Smiley />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 leading-4 p-0" style={{ margin: "7px 0 5px 7px" }}>
                            <button aria-label="settings" className="h-8">
                                <CogSixTooth className="text-default-500" />
                            </button>
                            <button aria-label="send message" className="h-8" onClick={handleSend}>
                                <Send viewBox="0 0 17 16" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <React.Fragment>
                <div className="fixed right-6 bottom-6 z-50">
                    <div
                        className="max-w-md w-[calc(100%-30px)] sm:w-[400px] h-[600px] bg-gray-900 rounded-lg shadow-xl hidden data-[open=true]:flex flex-col"
                        data-open={isOpen ? "true" : "false"}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                            <h1 className="text-white text-lg font-semibold">Virtual Assistant</h1>
                            <div className="flex items-center gap-4">
                                <button className="text-gray-400 hover:text-white transition">
                                    <RefreshCcw className="w-5 h-5" />
                                </button>
                                <button className="text-gray-400 hover:text-white transition" onClick={toggleChat}>
                                    {" "}
                                    <XMark className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index: number) => (
                                <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                            message.isUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-800 text-gray-200 rounded-bl-none"
                                        }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                    </div>
                                </div>
                            ))}
                            {/* Typing Indicator */}
                            {isLoading && (
                                // <div className="flex">
                                <TypingIndicator />
                                // </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-800">
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-zinc-700 rounded-full">
                                    <Smiley />
                                </button>
                                <input
                                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-400"
                                    placeholder="Enter your response (English only)"
                                    type="text"
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                />
                                <button
                                    className="p-2 text-blue-700 hover:text-blue-400 transition disabled:opacity-50"
                                    disabled={!input.trim()}
                                    onClick={handleSend}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="block data-[open=true]:hidden" data-open={isOpen ? "true" : "false"}>
                        <button
                            className="group bg-[#0f62fe] text-white min-w-12 place-items-center flex duration-300 transition-all py-2 px-4"
                            type="button"
                            onClick={toggleChat}
                            onMouseEnter={(e) => e.currentTarget.setAttribute("data-hover", "true")}
                            onMouseLeave={(e) => e.currentTarget.removeAttribute("data-hover")}
                        >
                            <svg
                                aria-hidden="true"
                                aria-label="Click to open"
                                className="cds--btn__icon"
                                fill="currentColor"
                                focusable="false"
                                height="32"
                                role="img"
                                viewBox="0 0 32 32"
                                width="32"
                            >
                                <path d="M16 19a6.9908 6.9908 0 01-5.833-3.1287l1.666-1.1074a5.0007 5.0007 0 008.334 0l1.666 1.1074A6.9908 6.9908 0 0116 19zM20 8a2 2 0 102 2A1.9806 1.9806 0 0020 8zM12 8a2 2 0 102 2A1.9806 1.9806 0 0012 8z" />
                                <path d="M17.7358,30,16,29l4-7h6a1.9966,1.9966,0,0,0,2-2V6a1.9966,1.9966,0,0,0-2-2H6A1.9966,1.9966,0,0,0,4,6V20a1.9966,1.9966,0,0,0,2,2h9v2H6a3.9993,3.9993,0,0,1-4-4V6A3.9988,3.9988,0,0,1,6,2H26a3.9988,3.9988,0,0,1,4,4V20a3.9993,3.9993,0,0,1-4,4H21.1646Z" />
                            </svg>
                            <span className="ml-2 hidden group-data-[hover=true]:block">Virtual assistant</span>
                        </button>
                    </div>
                </div>
            </React.Fragment>
            {/* <div
                aria-disabled="false"
                aria-hidden="true"
                aria-label="Open chat with Max - Unread messages: 1"
                className="outline-none fixed h-14 w-14 cursor-pointer right-4 md:right-10 bottom-12 border-none rounded-50 group block bg-none data-[open=true]:bg-orange-600 shadow-lg z-50"
                data-open={isOpen ? "true" : "false"}
                onClick={toggleChat}
            >
                <div className="cursor-pointer overflow-visible absolute h-full w-full rounded-50" style={{ background: "none" }}>
                    <div className="flex opacity-100 items-center justify-center h-full w-full group-data-[open=true]:opacity-0 group-data-[open=true]:hidden">
                        <div className="rounded-50 h-full w-full bg-transparent overflow-hidden">
                            <div
                                className="border-0 border-none rounded-50 overflow-hidden h-14 w-14"
                                style={{ backgroundSize: "cover", backgroundPosition: "50%", backgroundImage: "url(/bot.svg)" }}
                            />
                        </div>
                    </div>
                    <div
                        className="chatbot-icon hidden relative top-7 left-3 w-8 h-0 opacity-0 group-data-[open=true]:opacity-100 group-data-[open=true]:block leading-4 after:transform after:rotate-45 before:-rotate-45"
                        style={{ backgroundColor: "rgb(255, 255, 255)" }}
                    />
                </div>
                <div className="flex justify-center absolute -top-1 -right-1 w-[18px] h-[18px] rounded-50 bg-rose-800 leading-4 text-white group-data-[open=true]:invisible">
                    1
                </div>
            </div> */}
        </React.Fragment>
    );
};

export default ChatBot;
