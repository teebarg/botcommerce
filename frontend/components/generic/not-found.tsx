"use client";

import { Search, Home, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStoreSettings } from "@/providers/store-provider";

interface NotFoundProps {
    className?: string;
    scenario?: string;
}

export default function NotFoundUI({ scenario, className }: NotFoundProps) {
    const router = useRouter();
    const { settings } = useStoreSettings();

    const scenarios: Record<string, any> = {
        "404": {
            icon: <Home className="w-12 h-12 text-blue-500" />,
            title: "Page Not Found",
            description: "The page you're looking for doesn't exist or has been moved.",
            primaryAction: "Go Home",
            secondaryAction: "Go Back",
        },
        search: {
            icon: <Search className="w-12 h-12 text-purple-500" />,
            title: "No Results Found",
            description: "We couldn't find anything matching your search criteria. Try adjusting your filters or search terms.",
            primaryAction: "Clear Filters",
            secondaryAction: "Browse All",
        },
        data: {
            icon: <RefreshCw className="w-12 h-12 text-green-500" />,
            title: "No Data Available",
            description: "There's no data to display at the moment. This might be temporary or you may need different permissions.",
            primaryAction: "Refresh",
            secondaryAction: "Go back",
        },
        connection: {
            icon: <RefreshCw className="w-12 h-12 text-red-500" />,
            title: "Connection Lost",
            description: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
            primaryAction: "Retry",
            secondaryAction: "Go Offline",
        },
        server: {
            icon: <RefreshCw className="w-12 h-12 text-red-500" />,
            title: "Server Error",
            description: "An error occurred on our end. Please try again later.",
            primaryAction: "Retry",
            secondaryAction: "Go Home",
        },
    };

    const currentScenario = scenarios[scenario || "404"];

    const handlePrimaryAction = () => {
        if (scenario === "404") {
            router.push("/");
        } else if (scenario === "search") {
            router.push("/search");
        } else if (["data", "connection", "server"].includes(scenario!)) {
            router.refresh();
        }
    };

    const handleSecondaryAction = () => {
        if (scenario === "404") {
            router.back();
        } else if (scenario === "search") {
            router.back();
        } else if (["data", "connection", "server"].includes(scenario!)) {
            router.back();
        }
    };

    return (
        <div
            className={cn(
                "transition-all duration-300 bg-linear-to-br from-background to-secondary flex items-center justify-center px-4 py-24 w-full",
                className
            )}
        >
            <div className="max-w-md w-full text-center">
                <div className="rounded-2xl shadow-xl p-8 border transition-all duration-300 bg-secondary border-input">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-xl opacity-70 animate-pulse transition-colors bg-linear-to-r from-blue-100 to-purple-100" />
                            <div className="relative rounded-full p-4 shadow-lg transition-colors">{currentScenario.icon}</div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-3">{currentScenario.title}</h1>
                    <p className="mb-8 leading-relaxed text-muted-foreground">{currentScenario.description}</p>

                    <div className="space-y-3">
                        <Button className="w-full" size="lg" onClick={handlePrimaryAction}>
                            {currentScenario.primaryAction}
                        </Button>

                        <Button className="w-full" size="lg" variant="contrast" onClick={handleSecondaryAction}>
                            <ArrowLeft className="w-4 h-4" />
                            <span>{currentScenario.secondaryAction}</span>
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-input">
                        <p className="text-sm text-muted-foreground">
                            Need help?{" "}
                            <a className="font-medium transition-colors text-blue-500 hover:text-blue-600" href={`mailto:${settings?.contact_email}`}>
                                Contact our support team
                            </a>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full animate-bounce transition-colors bg-blue-500" />
                    <div className="w-2 h-2 rounded-full animate-bounce transition-colors bg-purple-500" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 rounded-full animate-bounce transition-colors bg-pink-500" style={{ animationDelay: "0.2s" }} />
                </div>
            </div>
        </div>
    );
}
