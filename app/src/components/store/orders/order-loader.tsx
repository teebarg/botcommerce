import { Skeleton } from "@/components/ui/skeleton";

export default function OrderStatusLoader() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-12 w-full">
            <div className="mb-6 flex flex-col items-center">
                <Skeleton className="w-12 h-12 rounded-full mb-3" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3.5 w-64" />
            </div>

            <div className="rounded-xl border bg-card overflow-hidden mb-4">
                <div className="grid grid-cols-2 divide-x divide-border border-b">
                    <div className="px-4 py-3">
                        <Skeleton className="h-2.5 w-20 mb-2" />
                        <Skeleton className="h-3.5 w-24" />
                    </div>
                    <div className="px-4 py-3">
                        <Skeleton className="h-2.5 w-16 mb-2" />
                        <Skeleton className="h-3.5 w-20" />
                    </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between border-b">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-20" />
                </div>
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3.5 w-24" />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-4 mb-4">
                <Skeleton className="h-2.5 w-32 mb-3" />
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3.5 w-28" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden mb-4">
                <div className="px-4 py-3">
                    <Skeleton className="h-3.5 w-32" />
                </div>
                <div className="divide-y divide-border border-t">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                            <div className="flex-1 flex flex-col gap-1.5">
                                <Skeleton className="h-3.5 w-3/5" />
                                <Skeleton className="h-3 w-2/5" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                            <Skeleton className="h-3.5 w-12 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border bg-card p-4 mb-4 space-y-3">
                <div className="flex items-start gap-3">
                    <Skeleton className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-4 mb-4">
                <Skeleton className="h-2.5 w-28 mb-3" />
                <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-3.5 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            <Skeleton className="w-full h-12 rounded-full mt-6" />
        </div>
    );
}