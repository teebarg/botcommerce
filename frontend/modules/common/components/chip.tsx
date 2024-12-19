import React from "react";
import { cn } from "@/lib/util/cn";

interface Props {
    title: string;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
}

const Chip: React.FC<Props> = ({ title, className = "", color = "primary", size = "sm" }) => {
    return (
        <React.Fragment>
            <div
                className={cn(
                    "relative max-w-fit min-w-min inline-flex items-center justify-between",
                    "box-border whitespace-nowrap px-1 rounded-full",
                    `bg-${color} text-${color}-foreground ${className}`,
                    {
                        "h-5 text-xs": size == "sm",
                        "h-6 text-small": size == "md",
                        "h-7 text-sm": size == "lg",
                    }
                )}
            >
                <span className="flex-1 text-inherit font-normal px-2">{title}</span>
            </div>
        </React.Fragment>
    );
};

export { Chip };
