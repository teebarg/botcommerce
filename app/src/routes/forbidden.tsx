import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/forbidden")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="bg-card rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path strokeLinecap="round" d="M8 11V7a4 4 0 0 1 8 0v4" />
                        <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                </div>
                <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                    403 Forbidden
                </span>
                <h1 className="text-xl font-semibold mb-2">Access restricted</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-7">
                    You don't have permission to view this page. This area is reserved for users with elevated privileges.
                </p>
                <div className="bg-secondary rounded-xl px-4 py-4 mb-7 text-left">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">What you can do</p>
                    <ul className="space-y-2">
                        {["Contact your admin to request access", "Log in with a different account", "Go back to the store homepage"].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 text-muted-foreground" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l2 2 4-4" />
                                    </svg>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate({ to: "/" })}
                        className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 text-muted-foreground hover:bg-gray-50 transition-colors"
                    >
                        Go back
                    </button>
                    <button
                        onClick={() => navigate({ to: "/collections" })}
                        className="flex-1 py-2.5 text-sm rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors"
                    >
                        Go to store
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-5">
                    Need access?{" "}
                    <a href="mailto:admin@yourstore.com" className="underline underline-offset-2">
                        Contact an admin
                    </a>
                </p>
            </div>
        </div>
    );
}
