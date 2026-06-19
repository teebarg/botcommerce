import { Separator } from "../ui/separator";

type LoaderVariant = "list" | "grid" | "detail" | "inline" | "cart" | "product-list"| "product-section";

interface PageLoaderProps {
    variant?: LoaderVariant;
    rows?: number;
    cols?: number;
    className?: string;
}

function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={`animate-pulse rounded bg-muted ${className}`}
            style={style}
        />
    );
}

function ListLoader({ rows = 4 }: { rows?: number }) {
    return (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-4 border-b border-border last:border-0"
                >
                    <Skeleton className="size-8 rounded-md shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-[45%]" />
                        <Skeleton className="h-2.5 w-[28%]" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}

function GridLoader({ rows = 2 }: { rows?: number }) {
    const count = 2 * rows;
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
                    <Skeleton className="w-full aspect-product" />
                    <div className="p-3 flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-4/5" />
                        <Skeleton className="h-3 w-2/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function DetailLoader() {
    return (
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
            <Skeleton className="h-5 w-1/3" />
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <Skeleton className="h-2.5 w-2/5" />
                        <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </div>
    );
}

function InlineLoader() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
    );
}

function CartLoader() {
    return (
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1 min-w-0">
                <Skeleton className="h-3 w-32 mb-3" />
                <div className="rounded-xl border border-border overflow-hidden bg-card">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
                            <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <Skeleton className="h-3 w-3/5" />
                                <Skeleton className="h-2.5 w-2/5" />
                                <Skeleton className="h-6 w-24 mt-1 rounded-md" />
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:w-80 shrink-0 space-y-4">
                <Skeleton className="h-3 w-28" />
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between">
                            <Skeleton className="h-3.5 w-12" />
                            <Skeleton className="h-3.5 w-20" />
                        </div>
                    </div>
                    <Skeleton className="w-full h-11" />
                </div>
            </div>
        </div>
    );
}

function ProductListLoader() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
                    <Skeleton className="w-full aspect-product" />
                    <div className="p-3 flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-4/5" />
                        <Skeleton className="h-3 w-2/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}


function ProductSectionLoader() {
    return (
        <div className="relative py-6 max-w-8xl mx-auto px-2">
            <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-12" />
            </div>
            <ProductListLoader />
        </div>
    );
}

export function PageLoader({ variant = "list", rows, className = "" }: PageLoaderProps) {
    return (
        <div className={className}>
            {variant === "list" && <ListLoader rows={rows} />}
            {variant === "grid" && <GridLoader rows={rows} />}
            {variant === "detail" && <DetailLoader />}
            {variant === "inline" && <InlineLoader />}
            {variant === "cart" && <CartLoader />}
            {variant === "product-list" && <ProductListLoader />}
            {variant === "product-section" && <ProductSectionLoader />}
        </div>
    );
}