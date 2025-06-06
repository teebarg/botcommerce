import React from "react";

import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success" | "current";
    size?: "sm" | "md" | "lg";
}

const Spinner: React.FC<Props> = ({ size = "sm", color = "primary", className }) => {
    const colorClass = {
        current: "border-b-current",
        default: "border-b-default",
        primary: "border-b-primary",
        secondary: "border-b-secondary",
        danger: "border-b-danger",
        warning: "border-b-warning",
        success: "border-b-success",
    };

    return (
        <div aria-label="spinner" className={cn("inline-flex", className)}>
            <div
                className={cn("relative", {
                    "w-5 h-5": size === "sm",
                    "w-8 h-8": size === "md",
                    "w-10 h-10": size === "lg",
                })}
            >
                <i
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-full animate-spinner-ease-spin border-solid border-t-transparent border-l-transparent border-r-transparent border-[3px]",
                        colorClass[color]
                    )}
                />
                <i
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-full opacity-75 animate-spinner-linear-spin border-dotted border-t-transparent border-l-transparent border-r-transparent border-[3px]",
                        colorClass[color]
                    )}
                />
            </div>
        </div>
    );
};

export { Spinner };
