export function AdminPendingComponent() {
    return (
        <div className="flex h-screen">
            <aside className="hidden md:flex w-[240px] min-w-[240px] flex-col gap-3 border-r border-border p-4">
                <div className="skeleton h-8 w-4/5 mb-2" />
                <div className="skeleton h-4 w-3/5" />
                <div className="mt-2 flex flex-col gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton h-9 rounded-lg" style={{ opacity: 1 - i * 0.1 }} />
                    ))}
                </div>
            </aside>

            {/* main content skeleton */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* navbar skeleton */}
                <nav className="flex h-14 items-center justify-between border-b border-border px-5">
                    <div className="skeleton h-5 w-40" />
                    <div className="flex gap-2">
                        <div className="skeleton h-8 w-8 rounded-full" />
                        <div className="skeleton h-8 w-8 rounded-full" />
                    </div>
                </nav>

                {/* page content skeleton */}
                <div className="p-6 flex-1">
                    {/* page header */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="skeleton h-7 w-44 mb-2" />
                            <div className="skeleton h-4 w-60" />
                        </div>
                        <div className="skeleton h-9 w-24 rounded-lg" />
                    </div>

                    {/* search/filter bar */}
                    <div className="flex gap-3 mb-4">
                        <div className="skeleton h-9 flex-1 rounded-lg" />
                        <div className="skeleton h-9 w-28 rounded-lg" />
                    </div>

                    {/* content rows */}
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="skeleton h-16 rounded-lg" style={{ opacity: 1 - i * 0.15 }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
