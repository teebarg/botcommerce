import { cn } from "@/utils";

export const IsNew = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute top-2 left-2 w-12 h-12 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-wide bg-emerald-500 shadow-lg",
                className
            )}
            style={{
                clipPath:
                    "polygon(50% 0%, 61% 15%, 80% 10%, 75% 28%, 95% 40%, 80% 52%, 90% 70%, 72% 70%, 65% 90%, 50% 78%, 35% 90%, 28% 70%, 10% 70%, 20% 52%, 5% 40%, 25% 28%, 20% 10%, 39% 15%)",
            }}
        >
            New
        </div>
    );
};
