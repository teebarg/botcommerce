import { currency } from "@/utils";
import { Button } from "@/components/ui/button";

export default function SelectionBar({ count, total, onReview }) {
    if (count === 0) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border glass px-5 py-2 shadow-lg backdrop-blur-xl">
                <div className="flex flex-col leading-tight">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {count} {count === 1 ? "item" : "items"}
                    </span>
                    <span className="font-mono text-lg font-semibold">{currency(total)}</span>
                </div>
                <Button onClick={onReview} className="rounded-full font-medium" variant="inverse" size="md">Review Selection</Button>
            </div>
        </div>
    );
}
