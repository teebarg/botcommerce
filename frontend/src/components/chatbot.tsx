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
                    className="right-4 bottom-20 fixed z-40 overflow-hidden h-full max-h-[600px] min-h-36 rounded-md translate-y-0 w-[400px]"
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
                        <div aria-hidden="false" className="flex items-center">
                            <div className="inline-block align-middle relative rounded-50 bg-white">
                                <div className="rounded-50 overflow-hidden bg-transparent">
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
                                className="text-white w-48 overflow-hidden text-ellipsis whitespace-nowrap ml-2 py-[1px] text-sm leading-3 inline-block align-middle relative"
                                style={{ color: "rgb(255, 255, 255)" }}
                            >
                                Max
                            </span>
                        </div>
                    </header>
                    <div className="h-[calc(100%-48px)] list-none m-0 p-0 overflow-hidden relative" style={{ background: "rgb(255, 255, 255)" }}>
                        <div className="relative h-full w-full" aria-hidden="false">
                            <div
                                className="w-full py-3 px-0 absolute -top-16 z-10 transition-all duration-200 ease-custom-ease delay-100"
                                style={{ background: "rgb(255, 255, 255)" }}
                            >
                                <div aria-live="polite" className="w-7" style={{ visibility: "hidden" }}>
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
                                    className="bottom-3 flex flex-col"
                                    style={{ position: "absolute", inset: "0px", overflow: "scroll", marginRight: "0px", marginBottom: "0px" }}
                                >
                                    <div role="grid" tab-index="0" aria-label="Messages from the conversation" className="flex flex-col gap-4">
                                        {messages.map((message, index) => (
                                            <div key={index} className="relative py-0 px-4 flex flex-col">
                                                {index == 0 && (
                                                    <p
                                                        className={cn("text-small my-3 mx-0 text-center uppercase min-h-4 leading-6")}
                                                        style={{ color: "rgb(53, 63, 69)" }}
                                                    >
                                                        Today 2:54 PM
                                                    </p>
                                                )}

                                                <ul
                                                    className={cn("list-none relative clear-both", message.isUser ? "pr-4" : "py-0 pl-10 pr-0")}
                                                    style={{ margin: "16px 0 0" }}
                                                >
                                                    <li className="mt-0">
                                                        <span className="text-small ml-1 align-top" style={{ color: "rgb(53, 63, 69)" }}>
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
                                                                    : "bg-content2 text-default-700 overflow-visible max-w-[calc(100%-16px)] float-left"
                                                            )}
                                                        >
                                                            <span className="m-0 max-w-full">
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
                    <React.Fragment>
                        <div
                            className="drift-widget-chat-bottom absolute bottom-0 bg-white w-[calc(100%-32px)] leading-4"
                            style={{ borderRadius: "0 0 5px 5px", padding: "0 16px 13px" }}
                        >
                            <div className="drift-widget-composer--default py-[3px] px-0 relative flex items-end w-full">
                                <div className="drift-widget-composer--text-area flex max-h-20 overflow-hidden relative flex-1">
                                    <pre> </pre>
                                    <label htmlFor="drift-widget-composer-input" className="visually-hidden">
                                        Write a reply...
                                    </label>
                                    <textarea
                                        className="drift-widget-input js-focus-visible--controlled"
                                        placeholder="Write a reply..."
                                        aria-label="Write a reply..."
                                        maxLength={4906}
                                        id="drift-widget-composer-input"
                                        style={{ color: "rgb(65, 65, 65)", borderColor: "rgb(139, 149, 156)", background: "white" }}
                                    />
                                    <button className="drift-widget-composer-emoji-toggle absolute bottom-2 right-3 border-none m-0 p-0 cursor-pointer text-center align-top inline-block h-6 w-6" aria-expanded="false" aria-label="open emoji picker">
                                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
                                            <path
                                                fill="#687882"
                                                fillRule="evenodd"
                                                d="M8 16c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM8 1.333A6.674 6.674 0 0 0 1.333 8 6.674 6.674 0 0 0 8 14.667 6.674 6.674 0 0 0 14.667 8 6.674 6.674 0 0 0 8 1.333zm0 12c-1.942 0-3.705-1.167-4.601-3.046A.666.666 0 1 1 4.6 9.713C5.275 11.123 6.577 12 8 12c1.431 0 2.733-.875 3.397-2.285a.666.666 0 1 1 1.206.57c-.886 1.88-2.65 3.048-4.603 3.048zM10.667 8a1.335 1.335 0 0 1-1.334-1.333 1.335 1.335 0 0 1 2.667 0C12 7.402 11.402 8 10.667 8zM5.333 8A1.335 1.335 0 0 1 4 6.667c0-.736.599-1.334 1.333-1.334a1.335 1.335 0 0 1 0 2.667z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="drift-widget-composer-actions flex items-end leading-4 p-0" style={{margin: "7px 0 7px 7px"}}>
                                    <button
                                        className="drift-widget-composer-send-button drift-widget-composer-send-button--disabled mx-auto m-0 p-0 cursor-pointer border-none text-center align-top inline-block h-6 w-6"
                                        aria-label="send message"
                                    >
                                        <svg
                                            aria-hidden="true"
                                            className="drift-default-icon drift-default-icon--send rounded-md outline-0 h-[14px]"
                                            width="17"
                                            height="16"
                                            viewBox="0 0 17 16"
                                        >
                                            <path
                                                fill="#f4b806"
                                                fillRule="evenodd"
                                                stroke="#f4b806"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M1 1l2.166 5.39 8.5 1.564-8.5 1.666L1 15l16-7z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                </div>
            </React.Fragment>
            <div
                onClick={toggleChat}
                className="outline-none fixed h-14 w-14 cursor-pointer right-4 bottom-4 border-none rounded-[50%] group block z-40 bg-none data-[open=true]:bg-orange-600 shadow-lg"
                aria-label="Open chat with Max in the Drift Widget messenger - Unread messages: 1"
                aria-disabled="false"
                aria-hidden="false"
                role="button"
                tab-index="0"
                data-open={isOpen ? "true" : "false"}
            >
                <div className="cursor-pointer overflow-visible absolute h-full w-full rounded-[50%]" style={{ background: "none" }}>
                    <div className="flex opacity-100 items-center justify-center h-full w-full group-data-[open=true]:opacity-0 group-data-[open=true]:hidden">
                        <div className="rounded-[50%] h-full w-full bg-transparent overflow-hidden">
                            <div
                                className="border-0 border-none rounded-[50%] overflow-hidden h-14 w-14"
                                style={{ backgroundSize: "cover", backgroundPosition: "50%", backgroundImage: "url(/bot.svg)" }}
                            />
                        </div>
                    </div>
                    <div
                        className="drift-controller-icon hidden relative top-7 left-3 w-8 h-0 opacity-0 group-data-[open=true]:opacity-100 group-data-[open=true]:block leading-4"
                        style={{ backgroundColor: "rgb(255, 255, 255)" }}
                    />
                </div>
                <div className="flex justify-center absolute -top-1 -right-1 w-[18px] h-[18px] rounded-[50%] bg-rose-800 leading-4 text-small text-white group-data-[open=true]:invisible">
                    1
                </div>
            </div>
        </React.Fragment>
    );
};

export default ChatBot;
