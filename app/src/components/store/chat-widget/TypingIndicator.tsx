import { Bot } from "lucide-react";

const TypingIndicator = () => (
    <div className="flex items-start gap-3 px-4">
        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
        </div>
        <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                />
            ))}
        </div>
    </div>
);

export default TypingIndicator;
