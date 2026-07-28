import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/sign-in")({
    validateSearch: (search) => ({
        redirect: (search.redirect as string) || "/",
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { redirect } = useSearch({ from: "/_auth/sign-in" });
    return (
        <div className="flex justify-center p-6">
            <SignIn routing="hash" forceRedirectUrl={`/auth/callback?redirect=${redirect || "/"}`} />
        </div>
    );
}
