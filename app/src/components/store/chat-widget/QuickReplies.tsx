import { motion } from "framer-motion";

interface QuickRepliesProps {
    replies: string[];
    onSelect: (reply: string) => void;
}

export const QuickReplies = ({ replies, onSelect }: QuickRepliesProps) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 px-4 pb-2">
        {replies.map((reply) => (
            <motion.button
                key={reply}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(reply)}
                className="px-4 py-2 rounded-full border border-primary/40 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
                {reply}
            </motion.button>
        ))}
    </motion.div>
);
