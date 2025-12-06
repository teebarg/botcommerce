import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    endContent?: React.ReactNode;
    startContent?: React.ReactNode;
    wrapperClass?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, description, startContent, endContent, wrapperClass, ...props }, ref) => {
        const id = React.useId();

        return (
            <div className={cn("", wrapperClass)}>
                {label && (
                    <label className="text-sm font-medium text-muted-foreground mb-0.5 block" htmlFor={id}>
                        {label}
                    </label>
                )}
                <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">{startContent}</span>
                    <input
                        ref={ref}
                        className={cn(
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground",
                            "flex h-11 w-full text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 px-1 bg-background",
                            "border rounded-md px-3 py-2 shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring",
                            startContent && "pl-12",
                            endContent && "pr-12",
                            className
                        )}
                        id={id}
                        type={type}
                        {...props}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2">{endContent}</span>
                    {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
                    {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
                </div>
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
