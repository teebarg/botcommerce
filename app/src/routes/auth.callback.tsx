import { useConfig } from "@/providers/store-provider";
import { Session } from "@/schemas";
import { loginFn } from "@/server/users.server";
import { api } from "@/utils/api";
import { tryCatch } from "@/utils/try-catch";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouteContext, useRouter } from "@tanstack/react-router";
import { ShoppingBag, Check, Lock } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

const authCallbackSchema = z.object({
    redirect: z.string().default("/"),
});

export const Route = createFileRoute("/auth/callback")({
    validateSearch: authCallbackSchema,
    ssr: false,
    component: RouteComponent,
});

const steps = [
    {
        label: "Identity verified",
        description: "Clerk confirmed your credentials",
        status: "completed" as const,
    },
    {
        label: "Exchanging session",
        description: "Generating your secure token",
        status: "active" as const,
    },
    {
        label: "Loading your profile",
        description: "Cart, preferences and order history",
        status: "pending" as const,
    },
    {
        label: "Ready",
        description: "Taking you to your destination",
        status: "pending" as const,
    },
];

function RouteComponent() {
    const queryClient = useQueryClient();
    const router = useRouter()
    const { isLoaded, isSignedIn } = useUser();
    const { isAuthenticated } = useRouteContext({ strict: false });
    const { getToken } = useAuth();
    const search = Route.useSearch();
    const { shop_name } = useConfig();

    useEffect(() => {
        if (!isLoaded) return;

        const run = async () => {
            if (!isSignedIn) {
                window.location.href = "/sign-in";
                return;
            }

            if (isAuthenticated && sessionStorage.getItem("auth_exchanged")) {
                window.location.href = search.redirect || "/";
                return;
            }

            const token = await getToken({ template: "default" });
            const { error, data: sessionUser } = await tryCatch(
                api.post<Session>("/auth/exchange", {}, { headers: { "X-Auth": token || "token" } })
            );

            if (error || !sessionUser) {
                console.error("Auth exchange failed:", error);
                window.location.href = "/";
                return;
            }

            await loginFn({ data: { sessionUser } });

            sessionStorage.setItem("auth_exchanged", "true");
            queryClient.invalidateQueries({ queryKey: ["session"] })
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            router.invalidate();
            window.location.assign(search.redirect || "/");
        };

        run();
    }, [isLoaded, isSignedIn]);

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-background px-6">
            <div className="w-full max-w-sm">

                <div className="flex items-center gap-2.5 mb-10">
                    <div className="w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5 text-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{shop_name}</span>
                </div>

                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    Welcome back
                </p>
                <h1 className="text-2xl font-medium text-foreground mb-1.5">Signing you in</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-10">
                    Just a moment while we set up your session securely.
                </p>

                <div className="flex flex-col mb-10">
                    {steps.map(({ label, description, status }, i) => (
                        <div key={i} className="flex gap-3.5">
                            <div className="flex flex-col items-center shrink-0">
                                {status === "completed" && (
                                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-success-foreground" />
                                    </div>
                                )}
                                {status === "active" && (
                                    <div className="w-5 h-5 rounded-full border-[1.5px] border-foreground flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                                    </div>
                                )}
                                {status === "pending" && (
                                    <div className="w-5 h-5 rounded-full border-[1.5px] border-border shrink-0" />
                                )}
                                {i < steps.length - 1 && (
                                    <div className="w-px flex-1 my-1.5 bg-border" />
                                )}
                            </div>
                            <div className={`pt-0.5 ${i < steps.length - 1 ? "pb-5" : ""}`}>
                                <p className={`text-sm font-medium mb-0.5 ${
                                    status === "completed"
                                        ? "text-success-foreground"
                                        : status === "active"
                                        ? "text-foreground"
                                        : "text-muted-foreground/40"
                                }`}>
                                    {label}
                                </p>
                                <p className={`text-xs leading-relaxed ${
                                    status === "pending"
                                        ? "text-muted-foreground/30"
                                        : "text-muted-foreground"
                                }`}>
                                    {description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs text-muted-foreground/50">Secured by Clerk · End-to-end encrypted</span>
                </div>
            </div>
        </div>
    );
}