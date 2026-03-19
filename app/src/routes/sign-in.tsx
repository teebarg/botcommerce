import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({
    validateSearch: (search) => ({
        redirect: (search.redirect as string) || "/",
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { redirect } = useSearch({ from: "/sign-in" });
    return (
        <div className="flex justify-center p-6">
            <SignIn routing="hash" forceRedirectUrl={`/auth/callback?redirect=${redirect || "/"}`} />
        </div>
    );
}
