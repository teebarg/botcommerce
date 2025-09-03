"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card";

interface RecentlyViewedProps {
    className?: string;
    title?: string;
    products?: ProductSearch[];
}

export function RecentlyViewed({ className, title = "Recently Viewed", products }: RecentlyViewedProps) {
    const [scrollPosition, setScrollPosition] = useState<number>(0);

    const handleScroll = (direction: "left" | "right") => {
        const container = document.getElementById("recently-viewed-scroll");
        if (!container) return;

        const cardWidth = 280; // Approximate card width + gap
        const scrollAmount = cardWidth * 2; // Scroll by 2 cards

        const newPosition =
            direction === "left"
                ? Math.max(0, scrollPosition - scrollAmount)
                : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

        container.scrollTo({ left: newPosition, behavior: "smooth" });
        setScrollPosition(newPosition);
    };

    if (products?.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                        <p className="text-muted-foreground text-sm">
                            {products?.length} item{products?.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => handleScroll("left")}
                        disabled={scrollPosition <= 0}
                        className={cn(
                            "p-2 rounded-full border transition-all duration-200",
                            "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
                            "hover:scale-105 active:scale-95"
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleScroll("right")}
                        className={cn("p-2 rounded-full border transition-all duration-200", "hover:bg-muted hover:scale-105 active:scale-95")}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div
                    id="recently-viewed-scroll"
                    className={cn("flex gap-4 overflow-x-auto scrollbar-hide", "scroll-smooth snap-x snap-mandatory pb-4 -mb-4")}
                    onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
                >
                    {products?.map((product: ProductSearch, idx: number) => (
                        <div
                            key={product.id}
                            className="flex-none w-64 snap-start"
                            style={{
                                animationDelay: `${idx * 100}ms`,
                            }}
                        >
                            <ProductCard key={idx} product={product} />
                        </div>
                    ))}
                </div>

                {products?.length && (
                    <div className="flex justify-center mt-4 md:hidden">
                        <div className="flex gap-1">
                            {Array.from({ length: Math.ceil(products?.length / 2) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-200",
                                        Math.floor(scrollPosition / 280) === i ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
