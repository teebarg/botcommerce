import { cn } from "@/lib/util/cn";
import React from "react";

interface Props {
    value: number;
    className?: string;
}

const Progress: React.FC<Props> = ({ value, className }) => {
    return (
        <React.Fragment>
            <div
                className={cn("flex flex-col gap-2 w-full", className)}
                aria-label="Loading..."
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${value}%`}
                role="progressbar"
            >
                <div className="z-0 relative bg-default-500/50 overflow-hidden h-2 rounded-full">
                    <div
                        className="h-full bg-primary rounded-full transition-transform !duration-500"
                        style={{ transform: `translateX(-${100 - value}%)` }}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default Progress;
