import { cn } from "@lib/util/cn";
import React, { useState, useRef, useEffect } from "react";

export interface TooltipProps {
    content: React.ReactNode | string;
    children?: React.ReactElement;
    position?: "top" | "bottom" | "left" | "right";
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    delay?: number;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, color = "default", position = "top", delay = 200, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const cssClass = {
        default: "bg-default",
        primary: "bg-primary",
        secondary: "bg-secondary",
        danger: "bg-danger",
        warning: "bg-warning",
        success: "bg-success",
    };

    const calculatePosition = () => {
        if (!targetRef.current || !tooltipRef.current) return;

        const targetRect = targetRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        const positions = {
            top: {
                x: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
                y: targetRect.top - tooltipRect.height - 8,
            },
            bottom: {
                x: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
                y: targetRect.bottom + 8,
            },
            left: {
                x: targetRect.left - tooltipRect.width - 8,
                y: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
            },
            right: {
                x: targetRect.right + 8,
                y: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
            },
        };

        setCoords(positions[position]);
    };

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
            const handleScroll = () => calculatePosition();

            window.addEventListener("scroll", handleScroll);
            window.addEventListener("resize", handleScroll);

            return () => {
                window.removeEventListener("scroll", handleScroll);
                window.removeEventListener("resize", handleScroll);
            };
        }
    }, [isVisible, position]);

    return (
        <>
            <div ref={targetRef} className="inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {children}
            </div>
            {isVisible && (
                <div
                    ref={tooltipRef}
                    aria-label="tooltip"
                    className={cn(
                        "px-3 py-2 text-sm font-medium rounded-md shadow-md text-default-foreground max-w-sm",
                        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                        cssClass[color],
                        className
                    )}
                    role="tooltip"
                    style={{
                        position: "fixed",
                        left: `${coords.x}px`,
                        top: `${coords.y}px`,
                        zIndex: 9999,
                    }}
                >
                    {content}
                </div>
            )}
        </>
    );
};

export { Tooltip };
