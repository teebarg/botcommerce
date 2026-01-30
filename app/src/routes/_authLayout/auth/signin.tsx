import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { MagicLinkForm } from "@/components/generic/auth/magic-link";

export const Route = createFileRoute("/_authLayout/auth/signin")({
    component: RouteComponent,
});

function RouteComponent() {
    const { callbackUrl } = Route.useRouteContext();
    return (
        <div>
            <div className="p-2 md:p-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-contrast/10 rounded-full mb-4">
                        <Mail className="text-contrast" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                    <p className="text-muted-foreground">Enter your email to receive a magic link</p>
                </div>

                <MagicLinkForm callbackUrl={callbackUrl} />

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        By signing in, you agree to our{" "}
                        <Link className="text-contrast font-medium" to="/terms">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link className="text-contrast font-medium" to="/privacy">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>

            <Separator />

            <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                    Need help?{" "}
                    <Link className="text-contrast font-medium" to="/contact-us">
                        Contact support
                    </Link>
                </p>
            </div>
        </div>
    );
}
