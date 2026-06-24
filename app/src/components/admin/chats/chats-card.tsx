import { Badge } from "@/components/ui/badge";
import { formatDate, timeAgo } from "@/utils";
import { BadgeVariant, Chat, ConversationStatus } from "@/schemas";
import ChatsActions from "./chats-actions";

interface ChatsCardProps {
    chat: Chat;
}

const statusVariant: Record<ConversationStatus, BadgeVariant> = {
    [ConversationStatus.ABANDONED]: "destructive",
    [ConversationStatus.ACTIVE]: "success-subtle",
    [ConversationStatus.COMPLETED]: "accent",
};

const MetaRow = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-xs font-medium ${mono ? "font-mono text-muted-foreground" : ""}`}>{value}</span>
    </>
);

const ChatsCard = ({ chat }: ChatsCardProps) => {
    return (
        <div className="bg-card border border-border rounded-lg p-4 mb-2.5">
            <div className="flex items-start justify-between mb-3">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
                    <MetaRow label="ID" value={chat.conversation_uuid} mono />
                    <MetaRow label="User" value={chat.user_id || "Anonymous"} />
                    <MetaRow label="Messages" value={chat.messages?.length ?? 0} />
                    <MetaRow label="Started" value={formatDate(chat.started_at)} />
                    <MetaRow label="Last active" value={timeAgo(chat.last_active)} />
                </div>
                <Badge variant={statusVariant[chat.status ?? ConversationStatus.ABANDONED]}>
                    {chat.status}
                </Badge>
            </div>

            <div className="border-t border-border pt-3">
                <ChatsActions chat={chat} />
            </div>
        </div>
    );
};

export default ChatsCard;