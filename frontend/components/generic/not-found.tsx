"use client";

import { Search, Home, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

import { cn } from "@/lib/util/cn";

interface NotFoundProps {
    className?: string;
    scenario?: string;
}

export default function NotFoundUI({ scenario, className }: NotFoundProps) {
    const router = useRouter();
    const scenarios: Record<string, any> = {
        "404": {
            icon: <Home className="w-16 h-16 text-blue-500" />,
            title: "Page Not Found",
            description: "The page you're looking for doesn't exist or has been moved.",
            primaryAction: "Go Home",
            secondaryAction: "Go Back",
        },
        search: {
            icon: <Search className="w-16 h-16 text-purple-500" />,
            title: "No Results Found",
            description: "We couldn't find anything matching your search criteria. Try adjusting your filters or search terms.",
            primaryAction: "Clear Filters",
            secondaryAction: "Browse All",
        },
        data: {
            icon: <RefreshCw className="w-16 h-16 text-green-500" />,
            title: "No Data Available",
            description: "There's no data to display at the moment. This might be temporary or you may need different permissions.",
            primaryAction: "Refresh",
            secondaryAction: "Go back",
        },
        connection: {
            icon: <RefreshCw className="w-16 h-16 text-red-500" />,
            title: "Connection Lost",
            description: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
            primaryAction: "Retry",
            secondaryAction: "Go Offline",
        },
    };

    const currentScenario = scenarios[scenario || "404"];

    const handlePrimaryAction = () => {
        if (scenario === "404") {
            router.push("/");
        } else if (scenario === "search") {
            router.push("/search");
        } else if (scenario === "data") {
            router.refresh();
        } else if (scenario === "connection") {
            router.refresh();
        }
    };

    const handleSecondaryAction = () => {
        if (scenario === "404") {
            router.back();
        } else if (scenario === "search") {
            router.back();
        } else if (scenario === "data") {
            router.back();
        } else if (scenario === "connection") {
            router.back();
        }
    };

    return (
        <div
            className={cn(
                "transition-all duration-300 bg-gradient-to-br from-background to-content1 flex items-center justify-center p-4",
                className
            )}
        >
            <div className="max-w-md w-full text-center">
                {/* Main Content */}
                <div className="rounded-2xl shadow-xl p-8 border transition-all duration-300 bg-content1 border-input">
                    {/* Animated Icon Container */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-xl opacity-70 animate-pulse transition-colors bg-gradient-to-r from-blue-100 to-purple-100" />
                            <div className="relative rounded-full p-4 shadow-lg transition-colors bg-content2">{currentScenario.icon}</div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold mb-3 transition-colors text-default-900">{currentScenario.title}</h1>

                    {/* Description */}
                    <p className="mb-8 leading-relaxed transition-colors text-default-500">{currentScenario.description}</p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button className="w-full" size="lg" variant="primary" onClick={handlePrimaryAction}>
                            {currentScenario.primaryAction}
                        </Button>

                        <Button className="w-full" size="lg" variant="outline" onClick={handleSecondaryAction}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span>{currentScenario.secondaryAction}</span>
                        </Button>
                    </div>

                    {/* Optional Help Text */}
                    <div className="mt-6 pt-6 border-t transition-colors border-gray-10 dark:border-gray-700">
                        <p className="text-sm transition-colors text-default-500">
                            Need help?{" "}
                            <a className="font-medium transition-colors text-blue-500 hover:text-blue-600" href="#">
                                Contact our support team
                            </a>
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 flex justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full animate-bounce transition-colors bg-blue-500" />
                    <div className="w-2 h-2 rounded-full animate-bounce transition-colors bg-purple-500" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 rounded-full animate-bounce transition-colors bg-pink-500" style={{ animationDelay: "0.2s" }} />
                </div>
            </div>
        </div>
    );
}
