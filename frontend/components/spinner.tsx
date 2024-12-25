import { cn } from "@lib/util/cn";
import React from "react";

interface Props {
    className?: string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    size?: "sm" | "md" | "lg";
}

const Spinner: React.FC<Props> = ({ size = "sm", color = "primary", className }) => {
    const colorClass = {
        default: "border-b-default",
        primary: "border-b-primary",
        secondary: "border-b-secondary",
        danger: "border-b-danger",
        warning: "border-b-warning",
        success: "border-b-success",
    };

    return (
        <React.Fragment>
            <div aria-label="Loading" className={cn("relative inline-flex flex-col gap-2 items-center justify-center", className)}>
                <div
                    className={cn("relative flex", {
                        "w-5 h-5": size === "sm",
                        "w-8 h-8": size === "md",
                        "w-10 h-10": size === "lg",
                    })}
                >
                    <i
                        className={cn(
                            "absolute w-full h-full rounded-full animate-spinner-ease-spin border-solid border-t-transparent border-l-transparent border-r-transparent border-[3px]",
                            colorClass[color]
                        )}
                    />
                    <i
                        className={cn(
                            "absolute w-full h-full rounded-full opacity-75 animate-spinner-linear-spin border-dotted border-t-transparent border-l-transparent border-r-transparent border-[3px]",
                            colorClass[color]
                        )}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export { Spinner };
