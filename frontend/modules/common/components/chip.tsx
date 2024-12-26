import React from "react";

import { cn } from "@/lib/util/cn";

interface Props {
    title: string;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
}

const Chip: React.FC<Props> = ({ title, className = "", color = "primary", size = "sm" }) => {
    const cssClass = {
        default: "bg-default text-default-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        danger: "bg-danger text-danger-foreground",
        warning: "bg-warning text-warning-foreground",
        success: "bg-success text-success-foreground",
    };
    return (
        <React.Fragment>
            <div
                className={cn(
                    "relative max-w-fit min-w-min inline-flex items-center justify-between",
                    "box-border whitespace-nowrap px-1 rounded-full",
                    {
                        "h-5 text-xs": size == "sm",
                        "h-6 text-small": size == "md",
                        "h-7 text-sm": size == "lg",
                    },
                    cssClass[color],
                    className
                )}
            >
                <span className="flex-1 text-inherit font-normal px-2">{title}</span>
            </div>
        </React.Fragment>
    );
};

export { Chip };
