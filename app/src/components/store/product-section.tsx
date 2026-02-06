import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductSearch } from "@/schemas";
import ProductCard from "./products/product-card";

interface ProductSectionProps {
    title: string;
    subtitle?: string;
    products: ProductSearch[];
    showGradient?: boolean;
    href?: string;
}

interface ScrollState {
    atStart: boolean;
    atEnd: boolean;
    activeIndex: number;
}

const ProductSection = ({ title, subtitle, products, href, showGradient = false }: ProductSectionProps) => {
    const listRef = useRef<HTMLUListElement>(null);
    const [scrollState, setScrollState] = useState<ScrollState>({
        atStart: true,
        atEnd: false,
        activeIndex: 0,
    });

    const updateScrollState = useCallback(() => {
        const node = listRef.current;

        if (!node) return;

        const { scrollLeft, scrollWidth, clientWidth } = node;
        const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
        const threshold = 6;

        const items = Array.from(node.querySelectorAll<HTMLLIElement>("li[data-card]"));
        let activeIndex = 0;

        if (items.length > 0) {
            const viewportCenter = scrollLeft + clientWidth / 2;
            let closestDistance = Number.POSITIVE_INFINITY;

            items.forEach((item, index) => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const distance = Math.abs(itemCenter - viewportCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    activeIndex = index;
                }
            });
        }

        setScrollState({
            atStart: scrollLeft <= threshold,
            atEnd: scrollLeft >= maxScrollLeft - threshold,
            activeIndex,
        });
    }, []);

    useEffect(() => {
        const node = listRef.current;

        if (!node) return;

        updateScrollState();

        const onScroll = () => updateScrollState();

        node.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", updateScrollState);

        return () => {
            node.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [updateScrollState]);

    const scrollToIndex = useCallback(
        (targetIndex: number) => {
            const node = listRef.current;

            if (!node) return;

            const items = node.querySelectorAll<HTMLElement>("li[data-card]");

            if (items.length === 0) return;

            const clampedIndex = Math.min(Math.max(targetIndex, 0), items.length - 1);
            const item = items[clampedIndex];

            if (!item) return;

            item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

            requestAnimationFrame(updateScrollState);
        },
        [updateScrollState]
    );

    return (
        <section className="relative py-6 max-w-8xl mx-auto">
            <Button
                aria-label="Scroll backward"
                className="carousel-nav-link absolute top-1/2 -translate-y-1/2 z-10 h-12 w-12 -left-6 hidden md:flex"
                size="icon"
                onClick={() => scrollToIndex(scrollState.activeIndex - 1)}
                disabled={scrollState.atStart}
            >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </Button>
            <Button
                aria-label="Scroll forward"
                className="carousel-nav-link absolute top-1/2 -translate-y-1/2 z-10 h-12 w-12 -right-6 hidden md:flex"
                size="icon"
                onClick={() => scrollToIndex(scrollState.activeIndex + 1)}
                disabled={scrollState.atEnd}
            >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </Button>
            <div className="px-4 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className={`font-display text-xl font-semibold ${showGradient ? "text-gradient" : ""}`}>{title}</h2>
                        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                    </div>
                    <Link to={href} className="flex items-center gap-1 text-sm text-primary font-medium">
                        See All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <ul ref={listRef} className="flex gap-4 overflow-x-auto hide-scrollbar px-2 md:px-0 pb-2">
                {products.map((product) => (
                    <li key={product.id} data-card>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ProductSection;
