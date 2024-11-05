"use client";

import { cn } from "@lib/util/cn";
import React, { useState, useEffect, useRef } from "react";
import Button from "@modules/common/components/button";
import { ArrowUpRightMini, XMark } from "nui-react-icons";
import { useSnackbar } from "notistack";
import { Input } from "@components/ui/input";

interface Props {}

interface Message {
    text: string;
    isUser: boolean;
}

const ChatBot: React.FC<Props> = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("chatbotOpen") !== "false";
        }

        return false;
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
            <React.Fragment>
                <div
                    className="drift-widget-chat-wrapper drift-widget-chat-wrapper__CONVERSATION drift-widget-chat-wrapper__open drift-widget-chat-wrapper__active-conversation drift-widget-chat-wrapper__no-footer-content right-4 bottom-20 fixed z-40 overflow-hidden h-full max-h-[50vh] min-h-36 rounded-md translate-y-0 w-[400px] min-w-[320px]"
                    style={{
                        margin: "34px 24px 0",
                        boxShadow: "0 7px 6px 1px rgba(0,0,0,.16",
                        background: "linear-gradient(180deg,transparent 10px 48px,#fff 48px)",
                    }}
                >
                    <header
                        className="py-2 px-3 overflow-hidden rounded-top-corners max-h-full text-white"
                        style={{ background: "rgb(255, 90, 45)" }}
                    >
                        <div aria-hidden="false" className="drift-widget-agent-presence flex items-center">
                            <div className="drift-widget-presence-avatar inline-block align-middle relative rounded-50 bg-white">
                                <div className="drift-widget-recipient-avatar rounded-50 overflow-hidden bg-transparent">
                                    <div
                                        className="w-8 h-8 shadow-none rounded-50 overflow-hidden border-2 border-solid border-white bg-cover"
                                        style={{ backgroundImage: "url(/bot.svg)", backgroundPosition: "50%" }}
                                    />
                                </div>
                                <svg
                                    aria-hidden="true"
                                    aria-labelledby="convo__1951869"
                                    className="rounded-md outline-0 align-middle h-2.5 w-2.5 absolute right-0 bottom-0 border-2 border-solid border-white"
                                    style={{ strokeWidth: 8 }}
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                    role="img"
                                >
                                    <circle cx="10" cy="10" r="9" />
                                </svg>
                            </div>
                            <span
                                className="drift-widget-recipient-name text-white w-48 overflow-hidden text-ellipsis whitespace-nowrap ml-2 py-[1px] text-sm leading-3 inline-block align-middle relative"
                                style={{ color: "rgb(255, 255, 255)" }}
                            >
                                Max
                            </span>
                        </div>
                    </header>
                    <div
                        className="drift-widget-message-history drift-widget-message-history--no-composer h-[calc(100%-48px)] list-none m-0 p-0 overflow-hidden relative"
                        style={{ background: "rgb(255, 255, 255)" }}
                    >
                        <div className="drift-widget-message-group-list-container relative h-full w-full" aria-hidden="false">
                            <div
                                className="drift-widget-message-group-list-loader w-full py-3 px-0 absolute -top-16 z-10 transition-all duration-200 ease-custom-ease delay-100"
                                style={{ background: "rgb(255, 255, 255)" }}
                            >
                                <div
                                    aria-live="polite"
                                    className="drift-widget-loader-balls drift-widget-loader-balls--medium w-7"
                                    style={{ visibility: "hidden" }}
                                >
                                    <svg
                                        aria-labelledby="loaderBallTitle_MessageGroupListLoading"
                                        viewBox="0 0 80 80"
                                        xmlns="http://www.w3.org/2000/svg"
                                        role="img"
                                    >
                                        <title id="loaderBallTitle_MessageGroupListLoading">Processing... please wait</title>
                                        <circle cx="10" cy="20" r="9" />
                                        <circle cx="40" cy="20" r="9" />
                                        <circle cx="70" cy="20" r="9" />
                                    </svg>
                                </div>
                            </div>
                            <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
                                <div
                                    className="drift-widget-message-group-list bottom-3 flex flex-col"
                                    style={{ position: "absolute", inset: "0px", overflow: "scroll", marginRight: "0px", marginBottom: "0px" }}
                                >
                                    <div role="grid" tab-index="0" aria-label="Messages from the conversation">
                                        {messages.map((message, index) => (
                                            <div key={index} className="drift-widget-message-group-wrapper relative py-0 px-4 bg-yellow-300 mb-4">
                                                {index == 0 && (
                                                    <p
                                                        className={cn(
                                                            "drift-widget-message-group-timestamp text-small my-3 mx-0 text-center uppercase min-h-4 leading-6"
                                                        )}
                                                        style={{ color: "rgb(53, 63, 69)" }}
                                                    >
                                                        Today 2:54 PM
                                                    </p>
                                                )}

                                                <ul
                                                    className={cn(
                                                        "drift-widget-message-group drift-widget-message-group-type--AGENT list-none relative clear-both mt-4",
                                                        message.isUser ? "pr-4" : "py-0 pl-10 pr-0"
                                                    )}
                                                >
                                                    <li className="drift-widget-message-sender mt-0">
                                                        <span
                                                            className="drift-widget-message--meta-author text-small ml-1 align-top"
                                                            style={{ color: "rgb(53, 63, 69)" }}
                                                        >
                                                            Max
                                                        </span>
                                                    </li>
                                                    <li className="drift-widget-message-group-avatar message-group-avatar-bottom bottom-1 absolute left-0">
                                                        <div className="drift-widget-recipient-avatar rounded-50 overflow-hidden bg-transparent">
                                                            <div
                                                                className="drift-widget-avatar drift-widget-avatar--small w-7 h-7 rounded-50 overflow-hidden border-2 border-white border-solid bg-cover"
                                                                style={{ backgroundImage: "url(/bot.svg)", backgroundPosition: "50%" }}
                                                            />
                                                        </div>
                                                    </li>
                                                    <li
                                                        role="gridcell"
                                                        tab-index="0"
                                                        className={cn(
                                                            "drift-widget-message drift-widget-message-sender--AGENT clear-both max-w-[calc(100%-48px)] w-auto relative my-0.5 mx-0 min-h-9",
                                                            message.isUser ? "float-right" : "float-left"
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "drift-widget-message--box drift-widget-message--HTML drift-widget-message--bot relative rounded-xl py-2 px-3 text-sm leading-5 inline-block",
                                                                message.isUser
                                                                    ? "bg-orange-700 text-white overflow-hidden max-w-[calc(100%-8px)] float-right"
                                                                    : "bg-content2 text-default-700 overflow-visible max-w-[calc(100%-16px)] float-left"
                                                            )}
                                                        >
                                                            <span tab-index="-1" className="m-0 max-w-full">
                                                                <p>Hey, there! What brings you to our site today?</p>
                                                            </span>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
            <div
                onClick={toggleChat}
                className="outline-none fixed h-[56px] w-[56px] cursor-pointer right-3 bottom-3 border-none p-0 rounded-[50%] group block z-40 bg-none data-[open=true]:bg-orange-600 shadow-lg"
                aria-label="Open chat with Max in the Drift Widget messenger - Unread messages: 1"
                aria-disabled="false"
                aria-hidden="false"
                role="button"
                tab-index="0"
                data-open={isOpen ? "true" : "false"}
            >
                <div
                    className="cursor-pointer overflow-visible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full rounded-[50%] leading-4"
                    style={{ background: "none" }}
                >
                    <div className="drift-controller-icon--active flex opacity-100 items-center justify-center h-full w-full group-data-[open=true]:opacity-0 group-data-[open=true]:hidden">
                        <div className="drift-widget-recipient-avatar circle drift-controller-icon--avatar rounded-[50%] h-full w-full bg-transparent overflow-hidden">
                            <div
                                className="drift-widget-avatar circle drift-controller-icon--avatar-avatar border-0 border-none rounded-[50%] overflow-hidden h-14 w-14"
                                style={{ backgroundSize: "cover", backgroundPosition: "50%", backgroundImage: "url(/bot.svg)" }}
                            />
                        </div>
                    </div>
                    <div
                        className="drift-controller-icon--close hidden relative top-7 left-3 w-8 h-0 opacity-0 group-data-[open=true]:opacity-100 group-data-[open=true]:block leading-4"
                        style={{ backgroundColor: "rgb(255, 255, 255)" }}
                    />
                </div>
                <div className="drift-controller-icon-unread flex justify-center absolute -top-1 -right-1 w-[18px] h-[18px] rounded-[50%] bg-rose-800 leading-4 text-small text-white group-data-[open=true]:invisible">
                    1
                </div>
            </div>
        </React.Fragment>
    );
};

export default ChatBot;
