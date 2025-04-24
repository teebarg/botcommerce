import * as React from "react";

import { cn } from "@/lib/util/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, label, ...props }, ref) => {
    const id = React.useId();

    return (
        <div>
            {label && (
                <label className="text-sm font-medium text-gray-500 mb-0.5" htmlFor={id}>
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={cn(
                    "w-full h-32 border rounded-lg resize-none",
                    "flex border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground",
                    "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                id={id}
                {...props}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
});

Textarea.displayName = "Textarea";

export { Textarea };
