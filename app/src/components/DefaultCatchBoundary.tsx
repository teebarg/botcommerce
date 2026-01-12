import { ErrorComponent, rootRouteId, useMatch, useNavigate, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw, ArrowLeft, ShoppingCart, AlertCircle } from "lucide-react";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
    const router = useRouter();
    const navigate = useNavigate();
    const isRoot = useMatch({
        strict: false,
        select: (state) => state.id === rootRouteId,
    });
    const [showDetails, setShowDetails] = useState(false);

    console.error(error);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative transition-colors duration-300">
            <div className="max-w-md w-full text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative animate-float">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <ShoppingCart className="w-20 h-20 text-muted-foreground/40" strokeWidth={1.5} />
                                <div className="absolute -top-1 -right-1 bg-error rounded-full p-1.5 animate-bounce-gentle">
                                    <AlertCircle className="w-5 h-5 text-error-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-dashed border-muted-foreground/10 animate-pulse-soft" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-muted-foreground/5" />
                </div>

                <div className="space-y-4 mb-8">
                    <h1 className="text-2xl font-semibold text-foreground">Oops! Something went wrong</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        We couldn't load this page. This might be a temporary issue — please try again in a moment.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Button
                        onClick={() => {
                            window.location.reload();
                        }}
                        className="gap-2 px-6 py-5 text-base font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    {isRoot ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                navigate({ to: "/" });
                            }}
                            className="gap-2 px-6 py-5 text-base font-medium"
                        >
                            Home
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.back();
                            }}
                            className="gap-2 px-6 py-5 text-base font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                    )}
                </div>
                <div className="bg-error-light border border-error-border rounded-lg overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-error hover:bg-error/5 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Technical Details
                        </span>
                        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${showDetails ? "max-h-40" : "max-h-0"}`}>
                        <div className="px-4 pb-4">
                            <code className="block text-left text-sm bg-background/50 rounded-md p-3 text-error font-mono break-all border border-error-border/50">
                                <ErrorComponent error={error} />
                            </code>
                        </div>
                    </div>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                    Need help?{" "}
                    <a href="/support" className="text-primary hover:underline underline-offset-2">
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    );
}
