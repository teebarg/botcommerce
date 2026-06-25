import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from 'lucide-react';
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/forbidden")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const { shop_email } = useConfig();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="bg-card rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LockKeyhole className="w-7 h-7 text-red-600" />
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
                        className="flex-1 py-2.5 text-sm rounded-xl border border-border"
                    >
                        Go back
                    </button>
                    <button
                        onClick={() => navigate({ to: "/collections" })}
                        className="flex-1 py-2.5 text-sm rounded-xl bg-gray-900 text-white font-medium"
                    >
                        Go to store
                    </button>
                </div>

                <p className="text-xs text-muted-foreground mt-5">
                    Need access?{" "}
                    <a href={`mailto:${shop_email}`} className="underline underline-offset-2">
                        Contact an admin
                    </a>
                </p>
            </div>
        </div>
    );
}
