import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Conversation, ConversationStatus } from "@/schemas";

interface CustomerCardProps {
    conversation: Conversation;
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

const ChatsCard = ({ conversation, actions }: CustomerCardProps) => {
    return (
        <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow">
            <div key={conversation.id} className="bg-secondary rounded-lg overflow-hidden shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="m-0 text-lg">Conversation #{conversation.id}</h3>
                    {getStatusBadge(conversation.status)}
                </div>
                <div className="text-base text-muted-foreground space-y-1">
                    <p>UUID: {conversation.conversation_uuid}</p>
                    <p>User: {conversation.user_id || "Anonymous"}</p>
                    <p>Messages: {conversation.messages?.length}</p>
                    <p>Started: {formatDate(conversation.started_at)}</p>
                    <p>Last Active: {formatDate(conversation.last_active)}</p>
                </div>
                {actions}
            </div>
        </Card>
    );
};

export default ChatsCard;
