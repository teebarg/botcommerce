import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/generic/auth/signup";
import LocalizedClientLink from "@/components/ui/link";
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/_authLayout/auth/signup")({
    component: RouteComponent,
});

function RouteComponent() {
    const { config } = useConfig();

    return (
        <>
            <h2 className="text-3xl font-semibold mb-1 text-center">{config?.shop_name}</h2>

            <p className="text-muted-foreground mb-6 text-center text-sm">
                Create your Store Member profile, and get access to an enhanced shopping experience.
            </p>

            <SignUpForm />
            <p className="mt-6 text-xs text-muted-foreground text-center font-medium">
                Already have an account?{" "}
                <LocalizedClientLink className="text-secondary" href="/auth/signin">
                    Sign in
                </LocalizedClientLink>
            </p>
        </>
    );
}
