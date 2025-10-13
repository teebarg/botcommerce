import { ArrowRight, Sparkles, Star } from "lucide-react";
import { BtnLink } from "@/components/ui/btnLink";

const HeroSection: React.FC = () => {
    return (
        <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    fetchPriority="high"
                    loading="eager"
                    alt="Fashion Hero"
                    className="w-full h-full object-cover opacity-90 dark:opacity-75"
                    src="/hero.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
            </div>

            <div className="absolute top-20 left-10 animate-float">
                <Sparkles className="w-6 h-6 text-contrast opacity-60" />
            </div>
            <div className="absolute top-40 right-20 animate-float delay-200">
                <Star className="w-8 h-8 text-contrast opacity-50" />
            </div>
            <div className="absolute bottom-32 left-20 animate-float delay-400">
                <Sparkles className="w-5 h-5 text-contrast opacity-70" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-left space-y-4 lg:space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-contrast/10 border border-contrast/20 text-contrast backdrop-blur-sm">
                            <Star className="w-4 h-4 text-contrast" />
                            <span className="text-sm font-medium">New Collection</span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                                Elevate Your
                                <span className="inline-block text-primary ml-3">Style</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-lg">
                                Discover our curated collection of premium fashion pieces that define elegance and sophistication.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary/50" />
                                <span>Premium Quality</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary/50" />
                                <span>Sustainable Fashion</span>
                            </div>
                            <div className="hidden lg:flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary/50" />
                                <span>Global Shipping</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <BtnLink href="/collections" className="group" size="lg">
                                Shop Collection
                                <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                            </BtnLink>
                            <BtnLink href="/bulk" className="group border-primary/50 hover:bg-primary/10" size="lg" variant="outline">
                                Bulk Purchase
                                <Sparkles className="w-5 h-5 ml-1 transition-transform group-hover:rotate-12" />
                            </BtnLink>
                        </div>

                        <div className="pt-6 lg:pt-8 border-t border-border/20">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">5K+</div>
                                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                                </div>
                                <div className="w-px h-12 bg-border/30" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">4.9★</div>
                                    <div className="text-sm text-muted-foreground">Customer Rating</div>
                                </div>
                                <div className="w-px h-12 bg-border/30" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">1000+</div>
                                    <div className="text-sm text-muted-foreground">Styles Available</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block animate-slide-up">
                        <div className="space-y-6">
                            <div className="bg-card/80 backdrop-blur-sm border border-border/20 rounded-2xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-card-foreground">Spring Collection</h3>
                                        <p className="text-sm text-muted-foreground">Limited Edition</p>
                                    </div>
                                    <div className="bg-primary/10 px-3 py-1 rounded-full">
                                        <span className="text-xs font-medium text-primary">30% OFF</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="aspect-square bg-card rounded-lg" />
                                    <div className="aspect-square bg-card rounded-lg" />
                                    <div className="aspect-square bg-card rounded-lg" />
                                </div>
                            </div>

                            <div className="bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl p-6">
                                <h3 className="font-semibold text-card-foreground mb-3">Trending Now</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-contrast animate-pulse" />
                                        <span className="text-sm text-muted-foreground">Oversized Blazers</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-contrast animate-pulse delay-500" />
                                        <span className="text-sm text-muted-foreground">Vintage Denim</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-contrast animate-pulse delay-1000" />
                                        <span className="text-sm text-muted-foreground">Statement Accessories</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-destructive text-white py-3">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-lg font-medium">🎉 Free shipping on orders over ₦50,000</p>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
