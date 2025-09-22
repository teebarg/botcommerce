"use client";

import React from "react";
import { ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSharedCollections } from "@/lib/hooks/useCollection";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SaleBannerProps {
    className?: string;
}

const SaleBanner: React.FC<SaleBannerProps> = ({ className = "" }) => {
    const { data } = useSharedCollections(undefined, true);
    const catalog = data?.shared[0];
    const router = useRouter();

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

                    <div className="absolute top-4 left-[20%] w-2 h-2 bg-white/30 rounded-full animate-bounce delay-300" />
                    <div className="absolute bottom-6 right-[30%] w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-bounce delay-700" />
                    <div className="absolute top-8 right-[70%] w-1 h-1 bg-blue-300/50 rounded-full animate-bounce delay-500" />
                </div>

                <div className="relative z-10 flex items-center justify-between text-white max-w-7xl mx-auto flex-col sm:flex-row gap-4">
                    <div className="flex-1 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/20 animate-fade-in text-sm">
                            <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                            <span className="text-white/90 font-medium">Exclusive Sale</span>
                        </div>

                        <div className="mb-2">
                            <h2 className="font-bold text-white leading-tight text-2xl sm:text-3xl">
                                Save Up To{" "}
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
                                    70% Off
                                </span>
                            </h2>
                            <p className="text-white/80 mt-2 font-light text-base sm:text-lg">Premium products at unbeatable prices</p>
                        </div>

                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            <span className="text-white/70 text-sm font-medium">Limited time offer</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                            size="lg"
                            onClick={() => router.push(`/shared/${catalog?.slug}`)}
                        >
                            Shop Now
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
        </div>
    );
};

export default SaleBanner;
