import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsLoader() {
    return (
        <div className="max-w-6xl mx-auto px-4 pb-12">
            <div className="mb-6">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-5 w-56" />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-3.5 w-32" />
                    </div>
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-3 w-6" />
                                <Skeleton className="h-1.5 flex-1 rounded-full" />
                                <Skeleton className="h-3 w-6" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-36 rounded-md" />
            </div>

            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="w-9 h-9 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3.5 w-28" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-3.5 w-full mb-1.5" />
                        <Skeleton className="h-3.5 w-4/5" />
                    </div>
                ))}
            </div>
        </div>
    );
}