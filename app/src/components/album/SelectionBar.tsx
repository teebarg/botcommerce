import { currency } from "@/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SelectionBarProps {
    count: number;
    total: number;
    onClear: () => void;
    onReview: () => void;
}

export default function SelectionBar({ count, total, onReview, onClear }: SelectionBarProps) {
    if (count === 0) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border glass px-5 py-2 shadow-lg backdrop-blur-xl">
                <div className="flex flex-col leading-tight">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {count} {count === 1 ? "item" : "items"}
                    </span>
                    <span className="font-mono text-lg font-semibold">{currency(total)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button onClick={onReview} className="rounded-full font-medium" variant="inverse" size="md">
                        Review Selection
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button
                        size="iconOnly"
                        className="rounded-full text-muted-foreground hover:text-foreground h-8 w-auto hover:bg-transparent"
                        onClick={onClear}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
