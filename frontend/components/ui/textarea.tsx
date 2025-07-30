import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
    color?: "bg-background" | "bg-content1" | "bg-content2";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, label, color = "bg-content1", ...props }, ref) => {
    const id = React.useId();

    return (
        <>
            {label && (
                <label className="text-sm font-medium text-gray-500 mb-0.5" htmlFor={id}>
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={cn(
                    "w-full min-h-[60px] border border-divider rounded-lg resize-none shadow-sm",
                    "flex px-3 py-2 text-sm placeholder:text-muted-foreground transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    color,
                    className
                )}
                id={id}
                {...props}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </>
    );
});

Textarea.displayName = "Textarea";

export { Textarea };
