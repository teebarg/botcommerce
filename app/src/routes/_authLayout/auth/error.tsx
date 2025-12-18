import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import z from "zod";

export const Route = createFileRoute("/_authLayout/auth/error")({
    validateSearch: z.object({
        error: z.string().optional(),
    }),
    beforeLoad: ({ search }) => {
        return {
            error: search.error,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { error } = Route.useRouteContext();

    const getErrorContent = () => {
        switch (error) {
            case "Verification":
                return {
                    title: "Link expired",
                    message: "Your magic link has expired for security reasons.",
                    details: "Magic links are only valid for 15 minutes. Please request a new one to continue.",
                    action: "Get new magic link",
                };
            case "invalid":
                return {
                    title: "Invalid link",
                    message: "This magic link is not valid or has already been used.",
                    details: "Links can only be used once. If you need to sign in again, please request a new magic link.",
                    action: "Get new magic link",
                };
            case "network":
                return {
                    title: "Connection error",
                    message: "Unable to connect to our servers.",
                    details: "Please check your internet connection and try again.",
                    action: "Try again",
                };
            case "Configuration":
                return {
                    title: "Configuration error",
                    message: "There is a problem with the server configuration.",
                    details: "Check the server logs for more information.",
                    action: "Try again",
                };
            case "Accessdenied":
                return {
                    title: "Access denied",
                    message: "You do not have permission to access this page.",
                    details: "Please contact support if you believe this is in error.",
                    action: "Contact support",
                };
            default:
                return {
                    title: "Something went wrong",
                    message: "We encountered an unexpected error.",
                    details: "Our team has been notified. Please try again or contact support if the problem persists.",
                    action: "Try again",
                };
        }
    };

    const errorContent = getErrorContent();

    return (
        <div>
            <div className="p-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                        <AlertTriangle className="text-orange-600" size={32} />
                    </div>

                    <h2 className="text-2xl font-bold mb-3">{errorContent.title}</h2>
                    <p className="text-muted-foreground text-lg mb-4">{errorContent.message}</p>
                    <p className="text-sm text-muted-foreground mb-8">{errorContent.details}</p>

                    <div className="space-y-4">
                        <Button className="w-full" variant="emerald" onClick={() => window.history.back()}>
                            <ArrowLeft size={16} />
                            Back to sign in
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Still having trouble?{" "}
                    <a className="text-emerald-600 hover:text-emerald-700 font-medium" href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`}>
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    );
}
