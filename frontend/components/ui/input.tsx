import * as React from "react";

import { cn } from "@/lib/util/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, error, label, description, ...props }, ref) => {
    const id = React.useId();

    return (
        <div>
            {label && (
                <label className="text-sm font-medium text-default-500 mb-0.5 block" htmlFor={id}>
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground",
                    "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                type={type}
                {...props}
            />
            {description && <p className="text-xs text-foreground-500 mt-0.5">{error}</p>}
            {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
        </div>
    );
});

Input.displayName = "Input";

export { Input };
