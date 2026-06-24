export function AdminPageLoading() {
    return (
        <div className="flex items-center justify-center bg-background flex-1">
            <div className="flex flex-col items-center">

                <div className="relative w-9 h-9 mb-6">
                    <svg
                        className="absolute inset-0 animate-spin"
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                    >
                        <circle cx="18" cy="18" r="15" fill="none" className="stroke-border" strokeWidth="2" />
                        <circle cx="18" cy="18" r="15" fill="none" className="stroke-foreground" strokeWidth="2" strokeDasharray="30 70" strokeLinecap="round" />
                    </svg>
                </div>

                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                    Revoque Admin
                </p>
                <p className="text-sm text-muted-foreground">Please wait…</p>

            </div>
        </div>
    );
}

export default AdminPageLoading;