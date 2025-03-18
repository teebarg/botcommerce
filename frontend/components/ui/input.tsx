import * as React from "react";

import { cn } from "@/lib/util/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    endContent?: React.ReactNode;
    startContent?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, description, startContent, endContent, ...props }, ref) => {
        const id = React.useId();

        return (
            <div>
                {label && (
                    <label className="text-sm font-medium text-default-500 mb-0.5 block" htmlFor={id}>
                        {label}
                    </label>
                )}
                <div
                    className={cn(
                        "inline-flex w-full items-center h-full box-border pb-0.5 bg-background border border-input rounded-md px-3",
                        className
                    )}
                >
                    {startContent}
                    <input
                        ref={ref}
                        className={cn(
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground",
                            "flex h-10 w-full text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            className
                        )}
                        type={type}
                        id={id}
                        {...props}
                    />
                    {endContent}
                </div>
                {description && <p className="text-xs text-foreground-500 mt-0.5">{description}</p>}
                {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
