import * as React from "react";

import { cn } from "@/lib/util/cn";

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
            <div className={wrapperClass}>
                {label && (
                    <label className="text-sm font-medium text-default-500 mb-0.5 block" htmlFor={id}>
                        {label}
                    </label>
                )}
                <div
                    className={cn(
                        "inline-flex w-full items-center box-border bg-background border border-input rounded-md overflow-hidden",
                        className
                    )}
                >
                    <span className="ml-2">{startContent}</span>
                    <input
                        ref={ref}
                        className={cn(
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground",
                            "flex h-10 w-full text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 px-1 bg-inherit",
                            className
                        )}
                        id={id}
                        type={type}
                        {...props}
                    />
                    <span className="mr-2">{endContent}</span>
                </div>
                {description && <p className="text-xs text-foreground-500 mt-0.5">{description}</p>}
                {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
