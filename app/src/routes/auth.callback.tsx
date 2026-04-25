import { loginFn } from "@/server/users.server";
import { clientApi } from "@/utils/api.client";
import { SessionUser } from "@/utils/session";
import { tryCatch } from "@/utils/try-catch";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { z } from "zod";

const authCallbackSchema = z.object({
    redirect: z.string().default("/"),
});

export const Route = createFileRoute("/auth/callback")({
    component: RouteComponent,
    validateSearch: authCallbackSchema,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { isLoaded, isSignedIn } = useUser();
    const { isAuthenticated } = useRouteContext({ strict: false });
    const { getToken } = useAuth();
    const search = Route.useSearch();

    useEffect(() => {
        if (!isLoaded) return;

        const run = async () => {
            if (!isSignedIn) {
                window.location.href = "/sign-in";
                return;
            }

            // Prevent double execution
            if (isAuthenticated && sessionStorage.getItem("auth_exchanged")) {
                window.location.href = search.redirect || "/";
                return;
            }

            const token = await getToken({ template: "default" });
            const { error, data: sessionUser } = await tryCatch(
                clientApi.post<SessionUser>("/auth/exchange", {}, { headers: { "X-Auth": token || "t" } })
            );

            if (error || !sessionUser) {
                console.error("Auth exchange failed:", error);
                window.location.href = "/sign-in";
                return;
            }

            await loginFn({ data: { sessionUser } });

            sessionStorage.setItem("auth_exchanged", "true");
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            navigate({ to: search.redirect || "/" });
        };

        run();
    }, [isLoaded, isSignedIn]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background transition-colors px-4">
            <div className="flex flex-col items-center gap-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-2xl font-semibold tracking-tight text-foreground"
                >
                    Signing you in
                </motion.div>
                <div className="relative">
                    <div className="w-14 h-14 rounded-full border-4 border-border" />
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-t-transparent border-primary"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                </div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-muted-foreground">
                    Verifying your session and preparing your dashboard...
                </motion.p>
                <div className="mt-6 w-[280px] space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 rounded-xl bg-card animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
