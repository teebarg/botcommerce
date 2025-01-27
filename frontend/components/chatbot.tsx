"use client";

import { cn } from "@lib/util/cn";
import React, { useState, useEffect, useRef } from "react";
import { CogSixTooth, Send, Smiley } from "nui-react-icons";
import { useSnackbar } from "notistack";
import { VisuallyHidden } from "@react-aria/visually-hidden";

interface Props {}

interface Message {
    text: string;
    isUser: boolean;
}

const ChatBot: React.FC<Props> = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Set isOpen after hydration
        const savedIsOpen = localStorage.getItem("chatbotOpen") !== "false";

        setIsOpen(savedIsOpen);
    }, []);

    useEffect(() => {
        if (!isOpen) return; // Don't set initial messages if chat is closed

        const timer = setTimeout(() => {
            setMessages([
                { text: "Hi, welcome to our store", isUser: false },
                { text: "How can we help you today?", isUser: false },
            ]);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        if (input.trim()) {
            setMessages([...messages, { text: input, isUser: true }]);
            setInput("");

            // Get response from Rasa
            const botResponse = await getRasaResponse(input);

            setMessages((prev) => [...prev, { text: botResponse, isUser: false }]);
        }
    };

    const toggleChat = () => {
        const newIsOpen = !isOpen;

        setIsOpen(newIsOpen);
        localStorage.setItem("chatbotOpen", newIsOpen.toString());
    };

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
            <div
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
            </div>
        </React.Fragment>
    );
};

export default ChatBot;
