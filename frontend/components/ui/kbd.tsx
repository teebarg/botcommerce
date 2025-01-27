import React from "react";

import { cn } from "@/lib/util/cn";

interface Props {
    keys?: ("command" | "shift" | "option")[];
    className?: string;
    children: any;
}

const Kbd: React.FC<Props> = ({ keys = [], className, children }) => {
    const symbols = {
        command: "⌘", // Command symbol
        shift: "⇧", // Shift symbol
        option: "⌥", // Option symbol
    };

    return (
        <React.Fragment>
            <kbd
                className={cn(
                    "px-1.5 py-0.5 inline-flex space-x-0.5 items-center font-sans font-normal text-center text-sm shadow-small bg-default-100 text-foreground-500 rounded-lg",
                    className
                )}
            >
                {keys.map((key, index: number) => (
                    <abbr key={index} className="no-underline" title={key}>
                        {symbols[key]}
                    </abbr>
                ))}
                <span>{children}</span>
            </kbd>
        </React.Fragment>
    );
};

export { Kbd };
