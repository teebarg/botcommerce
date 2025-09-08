"use client";

import { ArrowRight, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import heroImage from "@/public/banner3.jpg";

const HeroSection: React.FC = () => {
    const router = useRouter();

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image priority alt="Fashion Hero" className="w-full h-full object-cover opacity-90 dark:opacity-75" sizes="100vw" src={heroImage} />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent dark:from-background/85 dark:via-background/40" />
            </div>

            <div className="absolute top-20 left-10 animate-float">
                <Sparkles className="w-6 h-6 text-accent opacity-60" />
            </div>
            <div className="absolute top-40 right-20 animate-float delay-200">
                <Star className="w-8 h-8 text-accent opacity-50" />
            </div>
            <div className="absolute bottom-32 left-20 animate-float delay-400">
                <Sparkles className="w-5 h-5 text-accent opacity-70" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-left space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-foreground backdrop-blur-sm">
                            <Star className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">New Collection</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
                                Elevate Your
                                <span className="block text-accent">Style</span>
                            </h1>
                            <p className="text-xl sm:text-2xl text-muted-foreground max-w-lg">
                                Discover our curated collection of premium fashion pieces that define elegance and sophistication.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                                <span>Premium Quality</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                                <span>Sustainable Fashion</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                                <span>Global Shipping</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button className="group" size="xl" variant="hero" onClick={() => router.push("/collections")}>
                                Shop Collection
                                <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button className="group" size="xl" variant="elegant" onClick={() => router.push("/bulk")}>
                                Bulk Purchase
                                <Sparkles className="w-5 h-5 ml-1 transition-transform group-hover:rotate-12" />
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-border/20">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-foreground">5K+</div>
                                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                                </div>
                                <div className="w-px h-12 bg-border/30" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-foreground">4.9★</div>
                                    <div className="text-sm text-muted-foreground">Customer Rating</div>
                                </div>
                                <div className="w-px h-12 bg-border/30" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-foreground">1000+</div>
                                    <div className="text-sm text-muted-foreground">Styles Available</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block animate-slide-up">
                        <div className="space-y-6">
                            <div className="bg-card/80 backdrop-blur-sm border border-border/20 rounded-2xl p-6 shadow-elegant">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-card-foreground">Spring Collection</h3>
                                        <p className="text-sm text-muted-foreground">Limited Edition</p>
                                    </div>
                                    <div className="bg-accent/10 px-3 py-1 rounded-full">
                                        <span className="text-xs font-medium text-accent">30% OFF</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="aspect-square bg-content1 rounded-lg" />
                                    <div className="aspect-square bg-content1 rounded-lg" />
                                    <div className="aspect-square bg-content1 rounded-lg" />
                                </div>
                            </div>

                            <div className="bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl p-6">
                                <h3 className="font-semibold text-card-foreground mb-3">Trending Now</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                                        <span className="text-sm text-muted-foreground">Oversized Blazers</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-accent animate-pulse delay-500" />
                                        <span className="text-sm text-muted-foreground">Vintage Denim</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-accent animate-pulse delay-1000" />
                                        <span className="text-sm text-muted-foreground">Statement Accessories</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
