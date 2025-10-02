import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../ui/button";

import ProductCard from "./products/product-card";

import { cn } from "@/lib/utils";
import { ProductSearch } from "@/schemas";

interface ScrollState {
    atStart: boolean;
    atEnd: boolean;
    activeIndex: number;
}

interface IconCollectionsProps {
    products: ProductSearch[];
    title: string;
    description: string;
}

const ProductsCarousel: React.FC<IconCollectionsProps> = ({ products, title, description }) => {
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
            <div className="relative mx-auto flex max-w-[1400px] flex-col pb-16 pt-14">
                <header className="flex gap-6 sm:items-end justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase text-default-500">{title}</p>
                        <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-default-900 md:text-2xl" id={headingId}>
                            {description}
                        </h2>
                    </div>
                    <div>
                        <div aria-label="Carousel controls" className="flex items-center gap-3" role="group">
                            <Button
                                aria-label="Scroll collections backward"
                                className={cn("h-12 w-12 rounded-full border bg-white hover:bg-white/90 text-gray-500")}
                                disabled={scrollState.activeIndex <= 0}
                                size="icon"
                                type="button"
                                onClick={() => scrollToIndex(scrollState.activeIndex - 1)}
                            >
                                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                            </Button>
                            <Button
                                aria-label="Scroll collections forward"
                                className={cn(
                                    "relative h-12 w-12 rounded-full border border-neutral-300 bg-white text-neutral-500",
                                    "hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                                )}
                                disabled={scrollState.activeIndex >= products.length - 1}
                                size="icon"
                                type="button"
                                onClick={() => scrollToIndex(scrollState.activeIndex + 1)}
                            >
                                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="relative mt-10">
                    <ul
                        ref={listRef}
                        aria-label="Products"
                        className="m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-12 pr-8 sm:pr-0"
                        style={{ scrollbarColor: "rgba(30,30,30,0.4) transparent" }}
                    >
                        {products.map((product: ProductSearch, idx: number) => (
                            <li
                                key={idx}
                                data-card
                                className="group/card relative flex-shrink-0 basis-[85%] snap-start snap-always sm:basis-[25%] min-w-[280px]"
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
