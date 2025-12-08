import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/utils";
import type { Chat, ConversationStatus } from "@/schemas";

interface CustomerCardProps {
    chat: Chat;
    actions?: React.ReactNode;
}

const getStatusBadge = (status?: ConversationStatus) => {
    const variants: Record<ConversationStatus, "destructive" | "emerald" | "warning"> = {
        ["ABANDONED"]: "destructive",
        ["ACTIVE"]: "emerald",
        ["COMPLETED"]: "warning",
    };

    return <Badge variant={variants[status ?? "ABANDONED"]}>{status}</Badge>;
};

const ChatsCard = ({ chat, actions }: CustomerCardProps) => {
    return (
        <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow">
            <div key={chat.id} className="bg-secondary rounded-lg overflow-hidden shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="m-0 text-lg">Chat #{chat.id}</h3>
                    {getStatusBadge(chat.status)}
                </div>
                <div className="space-y-1">
                    <p>UUID: {chat.conversation_uuid}</p>
                    <p>User: {chat.user_id || "Anonymous"}</p>
                    <p>Messages: {chat.messages?.length}</p>
                    <p>Started: {formatDate(chat.started_at)}</p>
                    <p>Last Active: {formatDate(chat.last_active)}</p>
                </div>
                {actions}
            </div>
        </Card>
    );
};

export default ChatsCard;
