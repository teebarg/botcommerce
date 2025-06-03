import React, { useState, useRef, useEffect } from "react";
import {
    MessageCircle,
    Bot,
    User,
    Search,
    Filter,
    Calendar,
    Clock,
    Star,
    MoreVertical,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    ExternalLink,
    Archive,
    Flag,
    Download,
    UserX,
    Eye,
} from "lucide-react";
import { ChatMessage } from "@/types/models";
import { formatDate } from "@/lib/util/util";
import { Conversation, ConversationStatus } from "@/types/models";
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

const ConversationViewer: React.FC<{ conversation: Conversation }> = ({ conversation }) => {
    const [showMobileList, setShowMobileList] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, []);

    const handleBackToList = () => {
        setShowMobileList(true);
    };

    return (
        // <div className="h-screen bg-gray-50 flex flex-col lg:flex-row">
        <div className={`flex-1 flex flex-col`}>
            <>
                {/* Conversation Header */}
                <div className="bg-white border-b border-gray-200 py-4 px-1 md:px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleBackToList}
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                    !conversation.user
                                        ? "bg-gradient-to-br from-gray-500 to-gray-600"
                                        : "bg-gradient-to-br from-blue-500 to-purple-600"
                                }`}
                            >
                                {!conversation.user ? <UserX size={20} /> : conversation.user.image}
                            </div>

                            <div>
                                <h2 className="font-medium text-gray-900 flex items-center">
                                    {!conversation.user ? (
                                        <>
                                            <span className="text-gray-600">Anonymous</span>
                                            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Guest</span>
                                        </>
                                    ) : (
                                        <>
                                            {conversation.user?.first_name} {conversation.user?.last_name}
                                        </>
                                    )}
                                </h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                    {!conversation.user ? (
                                        <span className="flex items-center">
                                            <Eye size={14} className="mr-1" />
                                            Session: anon_456
                                        </span>
                                    ) : (
                                        <>
                                            <span className="flex items-center">
                                                <Mail size={14} className="mr-1" />
                                                {conversation.user.email}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <StatusBadge status={conversation.status} />
                            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
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
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {message.sender === "USER" ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                <div
                                    className={`rounded-2xl px-4 py-2 ${
                                        message.sender === "USER" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
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
                    <div ref={messagesEndRef} />
                </div>

                {/* Conversation Footer */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg flex items-center">
                                <Download size={16} className="mr-1" />
                                Export
                            </button>
                            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg flex items-center">
                                <Archive size={16} className="mr-1" />
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            </>
        </div>
        // </div>
    );
};

export default ConversationViewer;
