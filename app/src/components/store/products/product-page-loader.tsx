function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function ProductPageLoader() {
    return (
        <div className="max-w-6xl mx-auto w-full md:py-8 md:px-4 md:grid md:grid-cols-2 md:gap-8 md:items-start">
            <div className="relative aspect-square md:aspect-product md:rounded-2xl overflow-hidden md:sticky md:top-16">
                <Skeleton className="w-full h-full rounded-none md:rounded-2xl" />
            </div>

            <div className="py-6 px-4 md:px-0 space-y-5">
                <div className="flex justify-end">
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>

                <div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-32" />
                </div>

                <div>
                    <Skeleton className="h-3.5 w-16 mb-2.5" />
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-12 rounded-full" />
                        ))}
                    </div>
                </div>

                <div>
                    <Skeleton className="h-3.5 w-20 mb-2.5" />
                    <div className="flex gap-2.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="w-9 h-9 rounded-full" />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                </div>

                <div className="flex items-center gap-2">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <Skeleton className="flex-1 h-12 rounded-xl" />
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-2/3" />
                </div>

                <div className="rounded-xl border border-border divide-y divide-border">
                    <div className="flex justify-between px-4 py-3">
                        <Skeleton className="h-3.5 w-12" />
                        <Skeleton className="h-3.5 w-20" />
                    </div>
                    <div className="flex justify-between px-4 py-3">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3.5 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}