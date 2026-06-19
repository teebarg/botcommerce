import { Link } from "@tanstack/react-router";
import { currency } from "@/utils";

interface HeroSectionProps {
    image: string;
}

export default function HeroSection({ image }: HeroSectionProps) {
    return (
        <div>
            <section className="md:hidden relative h-[65svh] w-full overflow-hidden">
                <img src={image} alt="New collection" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 space-y-3">
                    <span className="inline-block bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full tracking-wide">
                        New In
                    </span>
                    <h1 className="text-3xl font-display font-semibold text-white leading-tight">
                        Premium<br />Collection
                    </h1>
                    <p className="text-white/60 text-sm">From {currency(2000)}</p>
                    <div className="flex gap-3 pt-1">
                        <Link
                            to="/collections"
                            className="flex-1 flex items-center justify-center bg-white text-black font-semibold py-3.5 rounded-full text-sm"
                        >
                            Shop Now
                        </Link>
                        <Link
                            to="/bulk"
                            className="flex items-center justify-center border border-white/30 text-white font-medium py-3.5 px-5 rounded-full text-sm"
                        >
                            Bulk
                        </Link>
                    </div>
                    <div className="flex gap-1 pt-2">
                        <div className="h-0.5 flex-1 bg-white rounded-full" />
                        <div className="h-0.5 flex-1 bg-white/25 rounded-full" />
                        <div className="h-0.5 flex-1 bg-white/25 rounded-full" />
                    </div>
                </div>
            </section>

            <section className="hidden md:block relative min-h-[60vh] overflow-hidden bg-card">
                <div className="max-w-8xl mx-auto px-6 py-20 grid grid-cols-2 gap-12 items-center">
                    <div className="space-y-5">
                        <span className="inline-block border border-border text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                            New Collection
                        </span>
                        <h1 className="text-5xl font-display font-semibold tracking-tight leading-tight text-foreground">
                            Discover your<br />
                            <span className="text-primary">perfect style</span>
                        </h1>
                        <p className="text-muted-foreground max-w-sm">
                            Curated fashion pieces that define elegance and sophistication.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/collections"
                                className="flex items-center gap-2 bg-foreground text-background font-medium py-3 px-6 rounded-full text-sm"
                            >
                                Shop Collection
                            </Link>
                            <Link
                                to="/bulk"
                                className="flex items-center gap-2 border border-border text-foreground font-medium py-3 px-6 rounded-full text-sm hover:bg-muted transition-colors"
                            >
                                Bulk Purchase
                            </Link>
                        </div>
                        <div className="flex items-center gap-6 pt-4 border-t border-border">
                            {[["5K+", "Happy customers"], ["4.9★", "Rating"], ["1,000+", "Styles"]].map(([val, label]) => (
                                <div key={label}>
                                    <p className="text-lg font-semibold text-foreground">{val}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
                        <img src={image} alt="Collection" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>
        </div>
    );
}