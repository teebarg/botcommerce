import { useState, useRef } from "react";
import { User, Send, Paperclip, X } from "lucide-react";
import { cn } from "@/utils";

export function renderText(text: string): React.ReactNode {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
            return (
                <strong key={i} className="font-semibold">
                    {part.slice(2, -2)}
                </strong>
            );
        return part.split("\n").map((line, j, arr) => (
            <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
            </span>
        ));
    });
}

export function chatAvatar(image?: string, clx?: string): React.ReactNode {
    return (
        <div className={cn("w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden", clx)}>
            {!image ? (
                <User className="w-4 h-4 text-primary-foreground" />
            ) : (
                <img alt={image} className="w-full h-full object-contain" src={image ?? "/placeholder.jpg"} />
            )}
        </div>
    );
}


interface ChatInputProps {
    onSend: (message: string, file?: File) => void;
    disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
    const [input, setInput] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!input.trim() && !file) return;
        onSend(input.trim(), file || undefined);
        setInput("");
        setFile(null);
    };

    return (
        <div className="px-3 pt-3 pb-[calc(var(--sab)+4px)] border-t border-border bg-background/80 backdrop-blur-xl">
            {file && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 glass rounded-xl">
                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                    <button onClick={() => setFile(null)} className="p-0.5 hover:bg-muted rounded">
                        <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={() => fileRef.current?.click()}
                    className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground shrink-0"
                >
                    <Paperclip className="w-5 h-5" />
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <div className="flex-1 relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full resize-none bg-muted/50 border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 max-h-24"
                        disabled={disabled}
                    />
                </div>

                <button
                    disabled={disabled || (!input.trim() && !file)}
                    className="p-2.5 rounded-xl gradient-primary text-primary-foreground disabled:opacity-40 shrink-0"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
