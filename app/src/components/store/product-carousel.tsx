import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/store/products/product-card";
import type { ProductSearch } from "@/schemas";
import ComponentLoader from "@/components/component-loader";

interface ScrollState {
    atStart: boolean;
    atEnd: boolean;
    activeIndex: number;
}

interface IconCollectionsProps {
    products: ProductSearch[];
    isLoading?: boolean;
    variant?: "sale" | "electric";
}

const ProductsCarousel: React.FC<IconCollectionsProps> = ({ products, isLoading = false, variant = "sale" }) => {
    const headingId = useId();
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
        <section aria-labelledby={headingId} aria-live="polite" className="relative">
            <Button
                aria-label="Scroll backward"
                className="carousel-nav-link absolute top-1/2 -translate-y-1/2 z-10 h-12 w-12 -left-6 hidden md:flex"
                size="icon"
                onClick={() => scrollToIndex(scrollState.activeIndex - 1)}
                disabled={scrollState.activeIndex <= 0}
            >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </Button>
            <Button
                aria-label="Scroll forward"
                className="carousel-nav-link absolute top-1/2 -translate-y-1/2 z-10 h-12 w-12 -right-6 hidden md:flex"
                size="icon"
                onClick={() => scrollToIndex(scrollState.activeIndex + 1)}
                disabled={scrollState.activeIndex >= products.length - 1}
            >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </Button>
            <div className="relative pb-4 pt-2 overflow-hidden">
                {isLoading && <ComponentLoader className="h-[400px]" />}
                <ul ref={listRef} aria-label="Products" className="m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
                    {products?.map((product: ProductSearch, idx: number) => (
                        <li
                            key={idx}
                            data-card
                            className="group/card relative shrink-0 basis-[50%] snap-start snap-always sm:basis-[22%] min-w-[280px]"
                        >
                            <ProductCard product={product} variant={variant} index={idx} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default ProductsCarousel;
