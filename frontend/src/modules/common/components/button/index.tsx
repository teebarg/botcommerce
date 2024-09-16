"use client";

import React from "react";
import clsx from "clsx";
import { useButton } from "react-aria";
import { useRef } from "react";

interface Props {
    children: React.ReactNode;
    endContent?: React.ReactNode;
    startContent?: React.ReactNode;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success" | undefined;
    variant?: "solid" | "bordered" | "flat" | "shadow";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
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
    const sizeCss = {
        sm: "px-3 min-w-16 h-8 text-tiny gap-2 rounded-small",
        md: "px-4 min-w-20 h-10 text-small gap-2 rounded-medium",
        lg: "px-6 min-w-24 h-12 text-medium gap-3 rounded-large",
    };

    return (
        <React.Fragment>
            <button
                {...buttonProps}
                ref={ref}
                className={clsx(
                    `z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none bg-${color} text-${color}-foreground data-[hover=true]:opacity-hover`,
                    className,
                    variant == "shadow" ? `shadow-lg shadow-${color}/40` : "",
                    buttonProps.disabled ? "opacity-disabled pointer-events-none" : "",
                    sizeCss[size]
                )}
                style={style}
                {...props}
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
