import React from "react";
import { Bot, User, MoreVertical, ArrowLeft, Mail, UserX, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ChatMessage } from "@/schemas";
import { formatDate } from "@/lib/utils";
import { Conversation, ConversationStatus } from "@/schemas";
import { Badge } from "@/components/ui/badge";

const StatusBadge = ({ status }: { status: ConversationStatus }) => {
    const labels = {
        ["ABANDONED"]: "Abandoned",
        ["ACTIVE"]: "Open",
        ["COMPLETED"]: "Completed",
    };

    const variants: Record<ConversationStatus, "destructive" | "emerald" | "warning"> = {
        ["ABANDONED"]: "destructive",
        ["ACTIVE"]: "emerald",
        ["COMPLETED"]: "warning",
    };

    return <Badge variant={variants[status ?? "ABANDONED"]}>{labels[status]}</Badge>;
};

function cleanMarkdown(md: string) {
    return md
        .replace(/\t/g, "") // Remove tabs
        .replace(/[ ]{2,}/g, " ") // Extra spaces
        .trim();
}

const ConversationViewer: React.FC<{ conversation: Conversation; onClose: () => void }> = ({ conversation, onClose }) => {
    return (
        <div className="flex-1 flex flex-col max-h-[80vh] md:max-h-none md:h-[calc(100vh-1.5rem)]">
            {/* Conversation Header */}
            <div className="bg-content1p border-b border-default-200 py-4 px-1 md:px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button className="lg:hidden p-2 text-muted-foreground hover:bg-muted/20 rounded-lg" onClick={onClose}>
                            <ArrowLeft size={20} />
                        </button>

                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                !conversation.user ? "bg-gradient-to-br from-gray-500 to-gray-600" : "bg-gradient-to-br from-blue-500 to-purple-600"
                            }`}
                        >
                            {!conversation.user ? <UserX size={20} /> : conversation.user?.image}
                        </div>

                        <div>
                            <h2 className="font-medium flex items-center">
                                {!conversation.user ? (
                                    <>
                                        <span className="text-muted-foreground">Anonymous</span>
                                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Guest</span>
                                    </>
                                ) : (
                                    <>
                                        {conversation.user?.first_name} {conversation.user?.last_name}
                                    </>
                                )}
                            </h2>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                {!conversation.user ? (
                                    <span className="flex items-center">
                                        <Eye className="mr-1" size={14} />
                                        Session: anon_456
                                    </span>
                                ) : (
                                    <>
                                        <span className="flex items-center">
                                            <Mail className="mr-1" size={14} />
                                            {conversation.user.email}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <StatusBadge status={conversation.status} />
                        <button className="p-2 text-muted-foreground hover:bg-muted/20 rounded-lg">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.messages.map((message: ChatMessage, idx: number) => (
                    <div key={idx} className={`flex ${message.sender === "USER" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${
                                message.sender === "USER" ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                        >
                            <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.sender === "USER"
                                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                                {message.sender === "USER" ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            <div
                                className={`rounded-2xl px-4 py-2 ${
                                    message.sender === "USER"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                }`}
                            >
                                <div className="text-sm chatbot-message">
                                    {message.sender === "USER" ? message.content : <ReactMarkdown>{cleanMarkdown(message.content)}</ReactMarkdown>}
                                </div>
                                <p className={`text-xs mt-1 ${message.sender === "USER" ? "text-blue-100" : "text-gray-500"}`}>
                                    {formatDate(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                {conversation.messages.length === 0 && (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <p className="text-gray-500">No messages</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationViewer;
