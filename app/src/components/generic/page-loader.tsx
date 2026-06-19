type LoaderVariant = "list" | "grid" | "detail" | "inline";

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

function GridLoader({ cols = 4, rows = 1 }: { cols?: number; rows?: number }) {
    const count = cols * rows;
    return (
        <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
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

export function PageLoader({ variant = "list", rows, cols, className = "" }: PageLoaderProps) {
    return (
        <div className={className}>
            {variant === "list" && <ListLoader rows={rows} />}
            {variant === "grid" && <GridLoader cols={cols} rows={rows} />}
            {variant === "detail" && <DetailLoader />}
            {variant === "inline" && <InlineLoader />}
        </div>
    );
}