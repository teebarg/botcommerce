import { CategoriesWithProducts } from "@/server/categories.server";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../products/product-card";
import { ProductSearch } from "@/schemas";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import LocalizedClientLink from "@/components/ui/link";
import { Button } from "@/components/ui/button";

interface ScrollState {
    atStart: boolean;
    atEnd: boolean;
    activeIndex: number;
}

const ProductsCarousel = ({ name, slug, products }: { name: string; slug: string; products: ProductSearch[] }) => {
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

    if (products.length === 0) return null;

    return (
        <section aria-labelledby={headingId} aria-live="polite" className="relative overflow-hidden py-6">
            <div className="relative mx-auto flex max-w-[1400px] flex-col pb-4 pt-2">
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

                <header className="flex gap-6 sm:items-end justify-between">
                    <div>
                        <h2 className="font-semibold font-display text-2xl">{name}</h2>
                    </div>
                    <LocalizedClientLink
                        href={`/collections?cat_ids=${slug}`}
                        className="group flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-accent"
                    >
                        View All
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </LocalizedClientLink>
                </header>
                <div className="relative mt-4">
                    <ul ref={listRef} aria-label="Products" className="m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
                        {products?.map((product: ProductSearch, idx: number) => (
                            <li
                                key={idx}
                                data-card
                                className="group/card relative shrink-0 basis-[50%] snap-start snap-always sm:basis-[22%] min-w-[280px]"
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

export default function CategoriesWithProductsSection({ categoriesWithProducts }: { categoriesWithProducts: CategoriesWithProducts[] }) {
    return (
        <div className="container mx-auto px-4 bg-card">
            {categoriesWithProducts.map((category: CategoriesWithProducts) => (
                <ProductsCarousel key={category.id} name={category.name} slug={category.slug} products={category.products} />
            ))}
        </div>
    );
}
