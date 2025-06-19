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
        subtitle: "Preparing your experience...",
        steps: [
            {
                id: "security",
                title: "Initializing secure connection",
                description: "Establishing encrypted protocols...",
                icon: <Shield className="w-4 h-4" />,
            },
            {
                id: "catalog",
                title: "Loading product catalog",
                description: "Fetching latest inventory...",
                icon: <Package className="w-4 h-4" />,
            },
            {
                id: "personalization",
                title: "Personalizing recommendations",
                description: "Analyzing your preferences...",
                icon: <User className="w-4 h-4" />,
            },
            {
                id: "optimization",
                title: "Optimizing performance",
                description: "Fine-tuning experience...",
                icon: <Zap className="w-4 h-4" />,
            },
        ],
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

const ProgressBar: React.FC<{
    progress: number;
    isActive: boolean;
}> = ({ progress, isActive }) => {
    return (
        <div className={cn("relative w-80 h-3 rounded-full backdrop-blur-sm overflow-hidden shadow-inner bg-gray-500")}>
            <div
                className={cn(
                    "h-full bg-gradient-to-r from-[#93c5fd] to-[#a5b4fc] bg-[length:200%_100%] rounded-full transition-all duration-500 ease-out shadow-lg animate-pulse"
                )}
                style={{
                    width: `${progress}%`,
                }}
            />
            {isActive && (
                <div
                    className="absolute top-0 right-0 w-4 h-full rounded-full animate-pulse"
                    style={{
                        background: "radial-gradient(circle, var(rgba(255,255,255,0.8)) 0%, transparent 70%)",
                    }}
                />
            )}
        </div>
    );
};

const LoadingStepComponent: React.FC<{
    step: LoadingStep;
    isActive: boolean;
    isCompleted: boolean;
}> = ({ step, isActive, isCompleted }) => {
    return (
        <div className={cn("flex items-center gap-3 transition-all duration-500", isActive ? "scale-105 text-white" : "scale-100 text-gray-200")}>
            <div
                className="w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                    backgroundColor: isCompleted ? "#6366f1" : isActive ? "#3b82f6" : "rgba(255,255,255,0.3)",
                    color: isCompleted || isActive ? "#ffffff" : "rgba(248, 250, 252, 0.6)",
                }}
            >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.icon}
            </div>
            <div>
                <div className="text-sm font-medium tracking-wide">{step.title}</div>
                {isActive && <div className="text-xs mt-1 text-gray-100">{step.description}</div>}
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
            duration: 10000,
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

    return (
        <div suppressHydrationWarning className={cn("fixed inset-0  bg-gradient-to-br from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] z-40")}>
            <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 max-w-xl mx-auto`}>
                <FadeInComponent delay="10ms">
                    <div className="mb-8 text-center">
                        <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white")}>{config.title}</h1>
                        <p className="text-lg text-gray-100">{config.subtitle}</p>
                    </div>
                </FadeInComponent>

                <FadeInComponent delay="100ms">
                    <div className="mb-6">
                        <div className={`text-5xl md:text-6xl font-light text-center text-gray-200`}>
                            <span className="text-white">{Math.floor(progress)}</span>
                            <span>%</span>
                        </div>
                    </div>
                </FadeInComponent>

                <FadeInComponent delay="300ms">
                    <div className="mb-8">
                        <ProgressBar isActive={progress > 0} progress={progress} />
                    </div>
                </FadeInComponent>

                {currentStep && (
                    <FadeInComponent delay="500ms">
                        <div className="mb-8">
                            <p className="text-lg text-center font-medium text-gray-200">{currentStep.description}</p>
                        </div>
                    </FadeInComponent>
                )}

                {config.steps.length > 0 && (
                    <FadeInComponent delay="700ms">
                        <div className="space-y-1">
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
                )}
            </div>
        </div>
    );
};

export default PageLoader;
