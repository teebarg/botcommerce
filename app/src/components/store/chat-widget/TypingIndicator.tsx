import { motion } from "framer-motion";

export const TypingIndicator = () => (
    <div className="flex items-start gap-3 px-4">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-foreground">AI</span>
        </div>
        <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    </div>
);
