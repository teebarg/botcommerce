import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_mainLayoutPublic/unsubscribe")({
    component: UnsubscribePage,
});

function UnsubscribePage() {
    return (
        <div className="flex-1 flex items-center justify-center bg-background px-4">
            <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <h1 className="text-xl font-semibold">You&apos;ve been unsubscribed</h1>
                <p className="text-sm text-muted-foreground">
                    You won&apos;t receive marketing emails from us going forward. You may still receive order and account-related emails.
                </p>
            </div>
        </div>
    );
}
