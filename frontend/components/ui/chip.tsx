import { cn } from "@/lib/util/cn";
import React from "react";

interface Props {
    children: React.ReactNode;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "Shadow";
    size?: "sm" | "md" | "lg";
    className?: string;
    onClick?: () => void;
}

const Chip: React.FC<Props> = ({ children, onClick, className, color = "primary", variant = "solid", size = "sm" }) => {
    const sizeCss = {
        sm: "px-1 h-6 text-xs",
        md: "px-1 h-7 text-sm",
        lg: "px-2 h-8 text-base",
    };
    const colorCss = {
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
                    "relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap rounded-full",
                    sizeCss[size],
                    colorCss[color],
                    className
                )}
                onClick={onClick}
            >
                <span className="flex-1 text-inherit font-normal px-2">{children}</span>
            </div>
        </React.Fragment>
    );
};

export default Chip;
