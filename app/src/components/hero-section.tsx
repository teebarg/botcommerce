import { ArrowRight, Sparkles, Star } from "lucide-react";
import { BtnLink } from "@/components/ui/btnLink";
import { Link } from "@tanstack/react-router";
import { currency } from "@/utils";

interface HeroSectionProps {
    image: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ image }) => {
    return (
        <div>
            <div className="relative min-h-[80vh] hidden md:flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-linear-to-b from-background/80 via-background/60 to-background" />
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

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left space-y-2 lg:space-y-7 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-contrast/10 border border-contrast/20 text-contrast backdrop-blur-sm">
                                <Star className="w-4 h-4 text-contrast" />
                                <span className="text-sm font-medium">New Collection</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-5xl font-display font-bold text-foreground tracking-tight leading-tight">
                                    Discover Your
                                    <span className="text-primary block">Perfect Style</span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-lg">
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

                            <div className="flex gap-4 pt-2">
                                <BtnLink className="group" href="/collection" size="lg">
                                    Shop Collection
                                    <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                                </BtnLink>
                                <BtnLink className="group border-primary/50 hover:bg-primary/10" href="/bulk" size="lg" variant="outline">
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
                                            <p className="font-semibold text-card-foreground text-lg">Spring Collection</p>
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
            <section className="md:hidden relative screen-height w-full overflow-hidden">
                <img src={image} alt="image" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-32 left-0 right-0 px-6 space-y-4">
                    <div className="inline-block bg-white text-black text-xs font-semibold px-3 py-1 rounded-full mb-2">FEATURED</div>
                    <h1 className="text-4xl font-bold leading-tight text-gray-100">Premium Collection</h1>
                    <p className="text-lg text-gray-300">Premium look. Budget-friendly</p>
                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex flex-col">
                            <span>as low as</span>
                            <span className="text-3xl font-bold text-gray-100">{currency(2000)}</span>
                        </div>
                        <Link
                            to="/collections"
                            className="flex-1 flex items-center justify-center bg-white text-black font-semibold py-4 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HeroSection;
