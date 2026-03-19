// import { clientApi } from "@/utils/api.client";
// import { AuthUser, SessionUser, useAppSession } from "@/utils/session";
// import { tryCatch } from "@/utils/try-catch";
// import { useUser } from "@clerk/tanstack-react-start";
// // import { getToken } from "@clerk/tanstack-react-start";
// import { createFileRoute } from "@tanstack/react-router";
// import { useEffect } from "react";
// import { z } from "zod";
// import { useAuth } from "@clerk/tanstack-react-start";

// const authCallbackSchema = z.object({
//     redirect: z.string().default("/"),
// });

// export const Route = createFileRoute("/auth/callback")({
//     component: RouteComponent,
//     validateSearch: authCallbackSchema,
// });

// function RouteComponent() {
//     const { isSignedIn } = useUser();
//     const { getToken } = useAuth();
//     console.log("🚀 ~ RouteComponent ~ getToken:", getToken)
//     console.log("🚀 ~ RouteComponent ~ isSignedIn:", isSignedIn)
//     const search = Route.useSearch();
//     console.log("🚀 ~ RouteComponent ~ search:", search)

//     useEffect(() => {
//         const run = async () => {
//             console.log("🚀 ~ run ~ isSignedIn:", isSignedIn)
//             if (!isSignedIn) return;

//             // prevent double execution
//             if (sessionStorage.getItem("auth_exchanged")) return;

//             const token = await getToken({ template: "default" });
//             console.log("🚀 ~ run ~ token:", token);
//             const { error, data: sessionUser } = await tryCatch(
//                 clientApi.post<SessionUser>("/auth/exchange", { headers: { "X-Auth": token || "token" } })
//             );

//             console.log("🚀 ~ run ~ data:", sessionUser);
//             console.log("🚀 ~ run ~ error:", error);

//             sessionStorage.setItem("auth_exchanged", "true");
//             const session = await useAppSession();

//             await session.update({
//                 id: sessionUser?.id,
//                 user: sessionUser as AuthUser,
//             });

//             window.location.href = search.redirect || "/";
//         };

//         run();
//     }, [isSignedIn]);
//     return <div className="p-6">Signing you in...</div>;
// }

import { loginFn } from "@/server/users.server";
import { clientApi } from "@/utils/api.client";
import { SessionUser } from "@/utils/session";
import { tryCatch } from "@/utils/try-catch";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
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
    const router = useRouter();
    const navigate = useNavigate();
    const { isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const search = Route.useSearch();

    useEffect(() => {
        // Wait until Clerk has finished loading
        if (!isLoaded) return;

        const run = async () => {
            if (!isSignedIn) {
                // Not signed in after load — redirect to sign in
                console.log("not signed in")
                window.location.href = "/sign-in";
                return;
            }

            // Prevent double execution
            if (sessionStorage.getItem("auth_exchanged")) {
                window.location.href = search.redirect || "/";
                return;
            }

            const token = await getToken({ template: "default" });
            console.log("🚀 ~ run ~ token:", token);

            const { error, data: sessionUser } = await tryCatch(
                clientApi.post<SessionUser>("/auth/exchange", {},{
                    headers: { "X-Auth": token || "token" },
                })
            );

            // const { error, data: sessionUser } = await tryCatch(clientApi.post<SessionUser>("/auth/exchange"));
            console.log("🚀 ~ run ~ sessionUser:", sessionUser);
            console.log("🚀 ~ run ~ error:", error);

            if (error || !sessionUser) {
                console.error("Auth exchange failed:", error);
                // window.location.href = "/sign-in";
                return;
            }

            await loginFn({ data: { sessionUser } });

            sessionStorage.setItem("auth_exchanged", "true");
            // window.location.href = search.redirect || "/";
            // await router.invalidate(); // re-runs beforeLoad → fetchUser → isAuthenticated: true
            // navigate({ to: search.redirect || "/", replace: true });
            navigate({ to: search.redirect || "/" });
        };

        run();
    }, [isLoaded, isSignedIn]); // <-- isLoaded in deps is the key fix

    return <div className="p-6">Signing you in...</div>;
}
