"use client";

import React from "react";

import ClientOnly from "@/components/generic/client-only";
import { cn } from "@/lib/utils";

const WaveLoader: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn("flex items-center justify-center space-x-1", className)}>
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="w-1 h-8 rounded-full animate-wave"
                    style={{
                        background: "linear-gradient(to top, var(--input), var(--border))",
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "1.2s",
                    }}
                />
            ))}
        </div>
    );
};

const ComponentLoader: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <ClientOnly>
            <div className={cn("bg-card backdrop-blur-sm z-50 flex items-center justify-center", className)}>
                <div className="flex flex-col items-center space-y-6">
                    <WaveLoader />
                </div>
            </div>
        </ClientOnly>
    );
};

export default ComponentLoader;
