import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { AgentAvatar, ChatBubble, formatTime, TypingIndicator } from "./mesage";
import { clientApi } from "@/utils/api.client";
import { tryCatch } from "@/utils/try-catch";

interface Product {
    name: string;
    sku: string;
    price: string;
    description: string;
    image_url: string | null;
}

interface ChatMessage {
    id: string;
    role: "agent" | "user";
    text: string;
    time: string;
    sources?: string[];
    escalated?: boolean;
    products?: Product[];
}

interface ChatResponse {
    reply: string;
    session_id: string;
    sources: string[];
    escalated: boolean;
    products: Product[];
}

interface ChatWidgetProps {
    customerId?: number | null;
}

function getSessionId(): string {
    if (typeof window === "undefined") return crypto.randomUUID();
    let id = sessionStorage.getItem("chat_session_id");
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("chat_session_id", id);
    }
    return id;
}

export default function ChatWidget({ customerId = null }: ChatWidgetProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "agent",
            text: "Hi! I'm Alex from support 👋 How can I help you today?",
            time: formatTime(new Date()),
            sources: [],
            escalated: false,
            products: [],
        },
    ]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [unread, setUnread] = useState<number>(0);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Focus input and clear unread when opened
    useEffect(() => {
        if (open) {
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const send = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput("");

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            text,
            time: formatTime(new Date()),
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // const res = await fetch(`${apiUrl}/chat`, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         message: text,
            //         session_id: getSessionId(),
            //         customer_id: customerId,
            //     }),
            // });

            // if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const { error, data } = await tryCatch<ChatResponse>(
                clientApi.post<ChatResponse>("/chat", {
                    message: text,
                    session_id: getSessionId(),
                    customer_id: customerId,
                })
            );
            if (error) {
                throw new Error(error);
            }
            // const data: ChatResponse = await res.json();

            const agentMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "agent",
                text: data?.reply || "",
                time: formatTime(new Date()),
                sources: data?.sources || [],
                escalated: data?.escalated || false,
                products: data?.products || [],
            };

            setMessages((prev) => [...prev, agentMsg]);
            if (!open) setUnread((n) => n + 1);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "agent",
                    text: "Sorry, I couldn't connect. Please try again.",
                    time: formatTime(new Date()),
                    sources: [],
                    escalated: false,
                    products: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, open, customerId]);

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-rose-600 shadow-[0_4px_24px_rgba(225,29,72,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border-0 cursor-pointer"
                aria-label={open ? "Close chat" : "Open chat"}
            >
                {open ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
                {!open && unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                        {unread}
                    </span>
                )}
            </button>
            {open && (
                <div
                    className="fixed bottom-24 right-7 z-40 w-[385px] h-[570px] rounded-2xl bg-[#f7f6f3] shadow-[0_24px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden"
                    style={{
                        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                        animation: "chatSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                >
                    {/* Header */}
                    <div className="bg-slate-900 px-4 py-3.5 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <AgentAvatar size="md" />
                            <div>
                                <p className="text-white font-semibold text-sm leading-none tracking-tight">Alex</p>
                                <p className="text-slate-400 text-[11px] mt-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                    Online · Support
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-slate-500 hover:text-slate-200 transition-colors bg-transparent border-0 cursor-pointer text-xl leading-none p-1"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-3 scroll-smooth">
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} msg={msg} />
                        ))}
                        {loading && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input area */}
                    <div className="bg-white border-t border-slate-100 px-3 py-2.5 flex gap-2 items-end flex-shrink-0">
                        <textarea
                            ref={inputRef}
                            className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] resize-none outline-none bg-[#f7f6f3] text-slate-900 leading-snug focus:border-slate-400 transition-colors placeholder:text-slate-400 font-[inherit]"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Type a message…"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            onClick={send}
                            disabled={!input.trim() || loading}
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-rose-600 flex items-center justify-center flex-shrink-0 border-0 cursor-pointer transition-opacity ${
                                input.trim() && !loading ? "opacity-100" : "opacity-35 cursor-not-allowed"
                            }`}
                            aria-label="Send message"
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-slate-300 py-1.5 bg-white tracking-widest uppercase">Powered by AI support</p>
                </div>
            )}
        </>
    );
}
