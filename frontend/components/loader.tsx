import React from "react";

import { cn } from "@/lib/utils";

const WaveLoader: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn("flex items-center justify-center space-x-1", className)}>
            {[0, 1, 2, 3, 4].map((idx: number) => (
                <div
                    key={idx}
                    className="w-1 h-8 rounded-full animate-wave"
                    style={{
                        background: "linear-gradient(to top, var(--default-400), var(--default-600))",
                        animationDelay: `${idx * 0.1}s`,
                        animationDuration: "1.2s",
                    }}
                />
            ))}
        </div>
    );
};

const DotsLoader: React.FC = () => {
    return (
        <div className="flex items-center space-x-2">
            {[0, 1, 2].map((idx: number) => (
                <div
                    key={idx}
                    className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"
                    style={{
                        animationDelay: `${idx * 0.2}s`,
                        animationDuration: "1.4s",
                    }}
                />
            ))}
        </div>
    );
};

export default function PageLoader() {
    return (
        <div className="fixed inset-0 bg-content1 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-6">
                <WaveLoader />
                <div className="text-center space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Loading</div>
                    <DotsLoader />
                </div>
            </div>
        </div>
    );
}
