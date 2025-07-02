"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle, Shield, Package, User, Zap, CreditCard, Truck, Search } from "lucide-react";

import FadeInComponent from "./generic/fade-in-component";

import { cn } from "@/lib/utils";

interface LoadingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    duration?: number;
}

interface LoadingConfig {
    type: "authentication" | "page" | "checkout" | "search" | "custom";
    title?: string;
    subtitle?: string;
    steps?: LoadingStep[];
    duration?: number;
}

interface PageLoaderProps extends LoadingConfig {
    onComplete?: () => void;
    className?: string;
}

const LOADING_PRESETS: Record<string, Partial<LoadingConfig>> = {
    authentication: {
        title: "Authenticating",
        subtitle: "Securing your session...",
        steps: [
            {
                id: "verify",
                title: "Verifying credentials",
                description: "Validating your login information...",
                icon: <Shield className="w-4 h-4" />,
            },
            {
                id: "session",
                title: "Creating secure session",
                description: "Establishing encrypted connection...",
                icon: <CheckCircle className="w-4 h-4" />,
            },
            {
                id: "profile",
                title: "Loading profile",
                description: "Retrieving your account data...",
                icon: <User className="w-4 h-4" />,
            },
        ],
    },
    page: {
        title: "Loading",
        subtitle: "Just a moment...",
        steps: [],
    },
    checkout: {
        title: "Processing Order",
        subtitle: "Securing your purchase...",
        steps: [
            {
                id: "validation",
                title: "Validating order details",
                description: "Checking product availability...",
                icon: <Package className="w-4 h-4" />,
            },
            {
                id: "payment",
                title: "Processing payment",
                description: "Securing transaction...",
                icon: <CreditCard className="w-4 h-4" />,
            },
            {
                id: "fulfillment",
                title: "Preparing fulfillment",
                description: "Coordinating shipping...",
                icon: <Truck className="w-4 h-4" />,
            },
            {
                id: "confirmation",
                title: "Generating confirmation",
                description: "Creating order receipt...",
                icon: <CheckCircle className="w-4 h-4" />,
            },
        ],
    },
    search: {
        title: "Searching",
        subtitle: "Finding the perfect products...",
        steps: [
            {
                id: "query",
                title: "Processing search query",
                description: "Analyzing your search terms...",
                icon: <Search className="w-4 h-4" />,
            },
            {
                id: "results",
                title: "Fetching results",
                description: "Finding matching products...",
                icon: <Package className="w-4 h-4" />,
            },
        ],
    },
};

const WaveLoader: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn("flex items-center justify-center space-x-1", className)}>
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="w-1 h-8 bg-gradient-to-t from-zinc-600 to-zinc-400 rounded-full animate-wave"
                    style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "1.2s",
                    }}
                />
            ))}
        </div>
    );
};

const MinimalProgressBar: React.FC<{
    progress: number;
}> = ({ progress }) => {
    return (
        <div className="w-48 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-zinc-500 to-zinc-400 rounded-full transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                }}
            />
        </div>
    );
};

const DotsLoader: React.FC = () => {
    return (
        <div className="flex items-center space-x-2">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"
                    style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "1.4s",
                    }}
                />
            ))}
        </div>
    );
};

const LoadingStepComponent: React.FC<{
    step: LoadingStep;
    isActive: boolean;
    isCompleted: boolean;
}> = ({ step, isActive, isCompleted }) => {
    return (
        <div className={cn("flex items-center gap-3 transition-all duration-500", isActive ? "scale-105 text-zinc-100" : "scale-100 text-zinc-400")}>
            <div
                className="w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                    backgroundColor: isCompleted ? "#52525b" : isActive ? "#3f3f46" : "rgba(63, 63, 70, 0.3)",
                    color: isCompleted || isActive ? "#fafafa" : "#a1a1aa",
                }}
            >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.icon}
            </div>
            <div>
                <div className="text-sm font-medium tracking-wide">{step.title}</div>
                {isActive && <div className="text-xs mt-1 text-zinc-400">{step.description}</div>}
            </div>
        </div>
    );
};

const PageLoader: React.FC<PageLoaderProps> = ({ type, title, subtitle, steps }) => {
    const config = useMemo(() => {
        const preset = LOADING_PRESETS[type] || {};

        return {
            title: title || preset.title || "Loading",
            subtitle: subtitle || preset.subtitle || "Please wait...",
            steps: steps || preset.steps || [],
            duration: type === "page" ? 1000 : 3000, // Faster for page loads
        };
    }, [type, title, subtitle, steps]);

    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const currentStep = useMemo(() => config.steps[currentStepIndex], [config.steps, currentStepIndex]);

    useEffect(() => {
        const intervalDuration = 50;
        const progressIncrement = 100 / (config.duration / intervalDuration);

        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = Math.min(prev + progressIncrement, 100);

                if (config.steps.length > 0) {
                    const stepIndex = Math.floor((newProgress / 100) * config.steps.length);
                    setCurrentStepIndex(Math.min(stepIndex, config.steps.length - 1));
                }

                return newProgress;
            });
        }, intervalDuration);

        return () => clearInterval(interval);
    }, [config.duration, config.steps.length]);

    if (type === "page") {
        return (
            <div suppressHydrationWarning className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-6">
                    <WaveLoader />
                    <div className="text-center space-y-2">
                        <div className="text-sm font-medium text-zinc-300">Loading</div>
                        <DotsLoader />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div suppressHydrationWarning className="fixed inset-0 bg-zinc-950 z-50">
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 max-w-xl mx-auto">
                <FadeInComponent delay="10ms">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-zinc-100">{config.title}</h1>
                        <p className="text-lg text-zinc-400">{config.subtitle}</p>
                    </div>
                </FadeInComponent>

                {config.steps.length === 0 ? (
                    <FadeInComponent delay="100ms">
                        <div className="space-y-8">
                            <WaveLoader className="scale-150" />
                            <MinimalProgressBar progress={progress} />
                            <div className="text-center">
                                <div className="text-2xl font-light text-zinc-300">
                                    <span className="text-zinc-100">{Math.floor(progress)}</span>
                                    <span className="text-zinc-500">%</span>
                                </div>
                            </div>
                        </div>
                    </FadeInComponent>
                ) : (
                    <>
                        <FadeInComponent delay="100ms">
                            <div className="mb-6">
                                <div className="text-4xl md:text-5xl font-light text-center text-zinc-400">
                                    <span className="text-zinc-100">{Math.floor(progress)}</span>
                                    <span>%</span>
                                </div>
                            </div>
                        </FadeInComponent>

                        <FadeInComponent delay="300ms">
                            <div className="mb-8">
                                <MinimalProgressBar progress={progress} />
                            </div>
                        </FadeInComponent>

                        {currentStep && (
                            <FadeInComponent delay="500ms">
                                <div className="mb-8">
                                    <p className="text-lg text-center font-medium text-zinc-300">{currentStep.description}</p>
                                </div>
                            </FadeInComponent>
                        )}

                        <FadeInComponent delay="700ms">
                            <div className="space-y-3">
                                {config.steps.map((step, index) => (
                                    <LoadingStepComponent
                                        key={step.id}
                                        isActive={index === currentStepIndex}
                                        isCompleted={index < currentStepIndex}
                                        step={step}
                                    />
                                ))}
                            </div>
                        </FadeInComponent>
                    </>
                )}
            </div>
        </div>
    );
};

export default PageLoader;
