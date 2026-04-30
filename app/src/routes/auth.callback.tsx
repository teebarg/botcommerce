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
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background: "#0c0b09",
                backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #1c1810 0%, #0c0b09 70%)",
            }}
        >
            {/* Corner accents */}
            <span className="absolute top-5 left-5 w-4 h-4 border-t border-l border-[#c9a96e33]" />
            <span className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-[#c9a96e33]" />

            <div
                className="flex flex-col items-center"
            >
                {/* Monogram ring */}
                <div className="relative w-[72px] h-[72px] mb-8">
                    <div className="absolute inset-0 rounded-full border border-[#c9a96e22]" />
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: "1px solid transparent", borderTopColor: "#c9a96e", borderRightColor: "#c9a96e88" }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                    />
                    <motion.span
                        className="absolute inset-0 flex items-center justify-center text-[#c9a96e]"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, letterSpacing: "0.05em" }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    >
                        R
                    </motion.span>
                </div>

                <h1
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className="text-2xl tracking-[0.12em] uppercase text-[#e8dfc8] m-0 font-light"
                >
                    Signing you in
                </h1>

                <div
                    className="w-8 h-px my-3"
                    style={{ background: "linear-gradient(90deg, transparent, #c9a96e, transparent)" }}
                />

                <p
                    className="text-xxs tracking-[0.2em] uppercase text-[#8a7d65] m-0 mb-10"
                    style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
                >
                    Verifying your session
                </p>

                <div
                    className="w-[260px] flex flex-col gap-[10px]"
                >
                    {[100, 72, 88, 55].map((w, i) => (
                        <div
                            key={i}
                            className="h-px rounded-sm overflow-hidden"
                            style={{
                                width: `${w}%`,
                                background: "#1e1c16",
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
