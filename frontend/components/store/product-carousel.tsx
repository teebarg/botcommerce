import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import ProductCard from "@/components/store/products/product-card";
import { ProductSearch } from "@/schemas";
import ComponentLoader from "@/components/component-loader";
import { cn } from "@/lib/utils";

interface ScrollState {
    atStart: boolean;
    atEnd: boolean;
    activeIndex: number;
}

interface IconCollectionsProps {
    products: ProductSearch[];
    title?: string;
    description?: string;
    isLoading?: boolean;
}

const ProductsCarousel: React.FC<IconCollectionsProps> = ({ products, title, description, isLoading = false }) => {
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
        <section aria-labelledby={headingId} aria-live="polite" className="relative overflow-hidden">
            <div className="relative mx-auto flex max-w-[1400px] flex-col pb-4 pt-2">
                <header className="flex gap-6 sm:items-end justify-between">
                    <div>
                        <p className={cn("font-medium uppercase text-muted-foreground font-outfit", !title && "hidden")}>{title}</p>
                        <h2 className={cn("text-xl font-medium tracking-tight md:text-2xl", !description && "hidden")} id={headingId}>
                            {description}
                        </h2>
                    </div>
                    <div aria-label="Carousel controls" className="hidden md:flex items-center gap-3" role="group">
                        <Button
                            aria-label="Scroll collections backward"
                            className="h-12 w-12 rounded-full text-gray-800 dark:text-gray-100 border border-border"
                            disabled={scrollState.activeIndex <= 0}
                            size="icon"
                            onClick={() => scrollToIndex(scrollState.activeIndex - 1)}
                        >
                            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                        </Button>
                        <Button
                            aria-label="Scroll collections forward"
                            className="h-12 w-12 rounded-full text-gray-800 dark:text-gray-100 border border-border"
                            disabled={scrollState.activeIndex >= products.length - 1}
                            size="icon"
                            onClick={() => scrollToIndex(scrollState.activeIndex + 1)}
                        >
                            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                        </Button>
                    </div>
                </header>
                <div className="relative mt-10">
                    {isLoading && <ComponentLoader className="h-[400px]" />}
                    <ul ref={listRef} aria-label="Products" className="m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
                        {products.map((product: ProductSearch, idx: number) => (
                            <li
                                key={idx}
                                data-card
                                className="group/card relative flex-shrink-0 basis-[70%] snap-start snap-always sm:basis-[22%] min-w-[280px]"
                            >
                                <ProductCard product={product} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default ProductsCarousel;
