"use client";

import React from "react";
import clsx from "clsx";
import { AriaButtonProps, useButton } from "@react-aria/button";
import { useRef } from "react";

const buttonConfig: any = {
    primary: {
        bgColor: "bg-primary",
        color: "text-primary-foreground",
        shadow: "shadow-lg shadow-primary/40",
    },
    secondary: {
        bgColor: "bg-secondary",
        color: "text-secondary-foreground",
        shadow: "shadow-lg shadow-secondary/40",
    },
    default: {
        bgColor: "bg-default",
        color: "text-default-foreground",
        shadow: "shadow-lg shadow-default/40",
    },
    danger: {
        bgColor: "bg-danger",
        color: "text-danger-foreground",
        shadow: "shadow-lg shadow-danger/40",
    },
    warning: {
        bgColor: "bg-warning",
        color: "text-warning-foreground",
        shadow: "shadow-lg shadow-warning/40",
    },
    success: {
        bgColor: "bg-success",
        color: "text-success-foreground",
        shadow: "shadow-lg shadow-success/40",
    },

    // Sizes
    sm: "px-3 min-w-16 h-10 text-tiny gap-2 rounded-small",
    md: "px-4 min-w-20 h-12 text-small gap-2 rounded-medium",
    lg: "px-6 min-w-24 h-14 text-medium gap-3 rounded-large",
};

interface Props extends AriaButtonProps {
    children: React.ReactNode;
    endContent?: React.ReactNode;
    startContent?: React.ReactNode;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    variant?: "solid" | "bordered" | "flat" | "shadow";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const Button: React.FC<Props> = ({
    color = "default",
    variant = "solid",
    size = "md",
    className,
    style,
    isLoading = false,
    children,
    endContent,
    startContent,
    ...props
}) => {
    const ref = useRef<HTMLButtonElement | null>(null);
    const { buttonProps } = useButton(props, ref);

    return (
        <React.Fragment>
            <button
                {...buttonProps}
                ref={ref}
                className={clsx(
                    "z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap",
                    "font-normal overflow-hidden outline-none transition-transform-colors-opacity motion-reduce:transition-none",
                    buttonConfig[size],
                    buttonConfig[color].bgColor,
                    variant === "shadow" && buttonConfig[color].shadow,
                    buttonProps.disabled ? "pointer-events-none opacity-50" : "",
                    buttonConfig[color].color,
                    className
                )}
                style={style}
            >
                {isLoading && (
                    <div aria-label="Loading" className="relative inline-flex flex-col gap-2 items-center justify-center">
                        <div className="relative flex w-5 h-5">
                            <i className="absolute w-full h-full rounded-full animate-spinner-ease-spin border-solid border-t-transparent border-l-transparent border-r-transparent border-2 border-b-current" />
                            <i className="absolute w-full h-full rounded-full opacity-75 animate-spinner-linear-spin border-dotted border-t-transparent border-l-transparent border-r-transparent border-2 border-b-current" />
                        </div>
                    </div>
                )}
                {startContent}
                {children}
                {endContent}
            </button>
        </React.Fragment>
    );
};

export default Button;
