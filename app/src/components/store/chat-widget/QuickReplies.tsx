interface QuickRepliesProps {
    replies: string[];
    onSelect: (reply: string) => void;
}

export const QuickReplies = ({ replies, onSelect }: QuickRepliesProps) => (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
        {replies.map((reply) => (
            <button
                key={reply}
                onClick={() => onSelect(reply)}
                className="px-2.5 py-1 rounded-md border border-accent/40 text-xs text-accent cursor-pointer"
            >
                {reply}
            </button>
        ))}
    </div>
);
