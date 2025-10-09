"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/store/products/product-card";
import { ProductSearch } from "@/schemas";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { useProductSearch } from "@/lib/hooks/useProduct";
import { Separator } from "@/components/ui/separator";
import LocalizedClientLink from "@/components/ui/link";
import { useOverlayTriggerState } from "@react-stately/overlays";

interface SearchDialogProps {
    initialQuery?: string;
    searchDelay?: number;
    placeholder?: string;
}

export const SearchDialog = ({ initialQuery = "", searchDelay = 500, placeholder = "Search for products..." }: SearchDialogProps) => {
    const searchState = useOverlayTriggerState({});
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery] = useDebounce(query, searchDelay);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);

    const searchRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useProductSearch({ search: debouncedQuery, limit: 4, skip: 0, show_suggestions: true });
    const { data: trendingData } = useProductSearch({ collections: "trending", limit: 4, skip: 0 });
    // const { data: recommendedData } = useProductRecommendations(session?.id, 5);

    useEffect(() => {
        const savedHistory = localStorage.getItem("searchHistory");

        if (savedHistory) {
            setRecentSearches(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("searchHistory", JSON.stringify(recentSearches));
    }, [recentSearches]);

    const handleSuggestionClick = (suggestion: string) => {
        searchState.close();
        router.push(`/search/${suggestion}`);
    };

    const hasResults = query.trim() && !!data?.products?.length;
    const hasNoResults = query.trim() && (!data || data?.products?.length === 0) && !isLoading;

    return (
        <Sheet open={searchState.isOpen} onOpenChange={searchState.toggle}>
            <SheetTrigger>
                <div className="bg-card rounded-2xl hidden md:flex items-center gap-1.5 w-96 px-2 py-3">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">{query ? query : "Search for products..."}</span>
                </div>
                <div className="rounded-md md:hidden h-10 w-10 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                </div>
            </SheetTrigger>
            <SheetContent side="top">
                <VisuallyHidden>
                    <SheetHeader>
                        <SheetTitle>Search Products</SheetTitle>
                        <SheetDescription>Search for products, categories, and more</SheetDescription>
                    </SheetHeader>
                </VisuallyHidden>
                <div className="relative px-8 pb-8 overflow-y-auto max-h-screen min-h-[75vh]">
                    <div className="w-full sticky top-0 z-10 bg-background py-4">
                        <div
                            className={cn(
                                "flex items-center rounded-xl border transition-all duration-200 w-full max-w-96 mx-auto relative hover:border-primary/30"
                            )}
                        >
                            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                            <input
                                ref={inputRef}
                                className={cn(
                                    "pl-12 pr-12 py-2.5 bg-transparent border-0 outline-0",
                                    "text-foreground placeholder:text-muted-foreground",
                                    "transition-all duration-200 w-full"
                                )}
                                placeholder={placeholder}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                }}
                            />
                            {query && (
                                <button
                                    className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
                                    onClick={() => {
                                        setQuery("");
                                        searchRef.current?.focus();
                                    }}
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="h-full">
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                            </div>
                        )}
                        {hasResults && (
                            <div className="max-w-8xl mx-auto">
                                <div className="grid grid-cols-[300px_1fr] min-h-full">
                                    <div className="border-r p-6 sticky top-20 z-10">
                                        <h3 className="font-semibold text-sm tracking-wider mb-4">SUGGESTIONS</h3>
                                        <div className="space-y-2">
                                            {data?.suggestions?.map((term: string) => (
                                                <button
                                                    key={term}
                                                    onClick={() => handleSuggestionClick(term)}
                                                    className="block w-full text-left text-sm hover:text-primary transition-colors py-1"
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-semibold text-sm tracking-wider mb-4">PRODUCTS</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {data?.products?.map((product: ProductSearch) => <ProductCard key={product.id} product={product} />)}
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="text-right">
                                    <LocalizedClientLink
                                        href={`/search/${query}`}
                                        className="inline-block text-left text-sm hover:text-primary transition-colors py-1"
                                    >
                                        See all products
                                    </LocalizedClientLink>
                                </div>
                            </div>
                        )}
                        {hasNoResults && (
                            <div className="text-center py-8 max-w-6xl mx-auto">
                                <p className="uppercase">no results found</p>
                                <p className="text-sm text-muted-foreground mt-1">We are sorry but we cant find any results for “{query}”</p>
                            </div>
                        )}
                        {(hasNoResults || !query) && (
                            <div className="py-6 space-y-8 max-w-6xl mx-auto">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="h-5 w-5" />
                                        <h3 className="font-semibold text-sm tracking-wider">TRENDING SEARCHES</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data?.suggestions?.map((term: string) => (
                                            <Button
                                                key={term}
                                                variant="outline"
                                                onClick={() => handleSuggestionClick(term)}
                                                className="rounded-full font-medium text-xs px-4 py-2 h-auto"
                                            >
                                                {term}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-sm tracking-wider">TRENDING PRODUCTS</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {trendingData?.products?.map((product: ProductSearch) => <ProductCard key={product.id} product={product} />)}
                                    </div>
                                </div>
                            </div>
                        )}
                        {recentSearches.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    Recent Searches
                                </div>
                                <div className="space-y-1">
                                    {recentSearches.map((search: string, idx: number) => (
                                        <button
                                            key={idx}
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-search-hover transition-colors"
                                            onClick={() => handleSuggestionClick(search)}
                                        >
                                            <span className="text-sm text-foreground">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* TODO: Implement recommended products */}
                        {/* <div>
                                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                                        <Star className="w-4 h-4" />
                                        Recommended for You
                                    </div>
                                    <div className="space-y-1">
                                        {recommendedData?.recommendations?.map((product: ProductSearch, idx: number) => (
                                            <ProductCard key={idx} product={product} onProductSelect={handleProductSelect} />
                                        ))}
                                    </div>
                                </div> */}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
