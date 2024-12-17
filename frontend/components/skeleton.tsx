import { cn } from "@/lib/util/cn";
import React from "react";

function Skeleton({ className }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "relative overflow-hidden bg-content3 dark:bg-content2 pointer-events-none before:opacity-100 before:absolute before:inset-0",
                "before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-content4/30 before:bg-gradient-to-r",
                "before:from-transparent before:via-content4 dark:before:via-default-700/10 before:to-transparent after:opacity-100 after:absolute after:inset-0",
                className
            )}
        >
            <div className="opacity-0 transition-opacity motion-reduce:transition-none !duration-300"></div>
        </div>
    );
}

export { Skeleton };
