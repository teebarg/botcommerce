"use client";

import { cn } from "@lib/util/cn";
import { ChevronDown } from "nui-react-icons";
import React, { createContext, useContext, useState } from "react";

type AccordionContextType = {
    expanded: string | null;
    setExpanded: (value: string | null) => void;
    allowMultiple?: boolean;
};

const AccordionContext = createContext<AccordionContextType | null>(null);

export function Accordion({
    children,
    allowMultiple = false,
    className,
}: {
    children: React.ReactNode;
    allowMultiple?: boolean;
    className?: string;
}) {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <AccordionContext.Provider value={{ expanded, setExpanded, allowMultiple }}>
            <div className={cn("divide-y", className)}>{children}</div>
        </AccordionContext.Provider>
    );
}

export function AccordionItem({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
    const context = useContext(AccordionContext);

    if (!context) throw new Error("AccordionItem must be used within Accordion");

    const isExpanded = context.expanded === value;

    return (
        <div className={cn("", className)} data-open={isExpanded} data-state={isExpanded ? "open" : "closed"}>
            {children}
        </div>
    );
}

export function AccordionTrigger({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
    const context = useContext(AccordionContext);

    if (!context) throw new Error("AccordionTrigger must be used within AccordionItem");

    const isExpanded = context.expanded === value;

    const handleClick = () => {
        if (isExpanded) {
            context.setExpanded(null);
        } else {
            context.setExpanded(value);
        }
    };

    return (
        <h2 data-open={isExpanded}>
            <button
                aria-controls={`accordion-content-${value}`}
                aria-expanded={isExpanded}
                className={cn(
                    "flex py-4 w-full h-full gap-3 items-center outline-none transition-opacity",
                    "justify-between pr-4 text-left text-sm transition-all",
                    className
                )}
                data-open={isExpanded}
                type="button"
                onClick={handleClick}
            >
                <div className="flex-1 flex flex-col text-start">
                    <span className="text-foreground text-large" data-open={isExpanded}>
                        {children}
                    </span>
                </div>
                <span
                    aria-hidden={isExpanded}
                    className="text-default-500 transition-transform rotate-0 data-[open=true]:-rotate-90 rtl:-rotate-180 rtl:data-[open=true]:-rotate-90"
                    data-open={isExpanded}
                >
                    <ChevronDown
                        className={cn("h-4 w-4 shrink-0 transition-transform duration-400", {
                            "rotate-180": isExpanded,
                        })}
                    />
                </span>
            </button>
        </h2>
    );
}

export function AccordionContent({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
    const context = useContext(AccordionContext);

    if (!context) throw new Error("AccordionContent must be used within AccordionItem");

    const isExpanded = context.expanded === value;

    return (
        <div
            aria-labelledby={`accordion-trigger-${value}`}
            className={cn(
                "overflow-hidden transition-all duration-1000 ease-in-out",
                isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0",
                className
            )}
            data-open={isExpanded}
            id={`accordion-content-${value}`}
            role="region"
        >
            {children}
        </div>
    );
}
