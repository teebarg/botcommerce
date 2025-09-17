"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, Star } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useSession } from "next-auth/react";

import { ProductSearch } from "@/schemas";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { cn, currency } from "@/lib/utils";
import { useProductRecommendations, useProductSearch } from "@/lib/hooks/useProduct";

const ProductCard: React.FC<{ product: ProductSearch; onProductSelect?: (product: ProductSearch) => void }> = ({ product, onProductSelect }) => {
    const { priceInfo } = useProductVariant(product);

    return (
        <div
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-search-hover transition-colors cursor-pointer group"
            onClick={() => onProductSelect?.(product)}
        >
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img
                    alt={product.name}
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    src={product.images[0] || product.image || "/placeholder.jpg"}
                />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{product.category_slugs?.[0]}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-sm text-primary">{currency(priceInfo.minPrice)}</span>
                    {product.average_rating > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-yellow-500">★</span>
                            <span className="text-xs text-muted-foreground">{product.average_rating}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ProductSearchProps {
    initialQuery?: string;
    onProductSelect?: (product: ProductSearch) => void;
    searchDelay?: number;
    className?: string;
    placeholder?: string;
    closeOnSelect?: boolean;
}

const ProductSearchClient: React.FC<ProductSearchProps> = ({
    initialQuery = "",
    onProductSelect,
    searchDelay = 500,
    className,
    placeholder = "Search for products...",
    closeOnSelect = true,
}) => {
    const { data: session } = useSession();
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery] = useDebounce(query, searchDelay);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const searchRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useProductSearch({ search: debouncedQuery, limit: 5, skip: 0, show_suggestions: true });
    const { data: trendingData } = useProductSearch({ collections: "trending", limit: 5, skip: 0 });
    const { data: recommendedData } = useProductRecommendations(session?.id, 5);

    useEffect(() => {
        const savedHistory = localStorage.getItem("searchHistory");

        if (savedHistory) {
            setRecentSearches(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("searchHistory", JSON.stringify(recentSearches));
    }, [recentSearches]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProductSelect = (product: ProductSearch) => {
        if (closeOnSelect) {
            setQuery(product.name);
            setIsOpen(false);
        }
        onProductSelect?.(product);
    };

    const handleRecentSearchClick = (search: string) => {
        setQuery(search);
        inputRef.current?.focus();
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setIsOpen(true);
    };

    const hasResults = query.trim() && data?.products?.length;
    const hasNoResults = query.trim() && (!data || data?.products?.length === 0) && !isLoading;
    const showSuggestions = isOpen;

    return (
        <div ref={dropdownRef} className={cn("relative w-full max-w-xl", className)}>
            <div className="relative">
                <div
                    className={cn(
                        "relative flex items-center rounded-xl border transition-all duration-200",
                        "hover:border-primary/30 hover:shadow-[var(--shadow-search)] bg-content1",
                        isOpen && "border-primary shadow-[var(--shadow-search)]"
                    )}
                >
                    <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        className={cn(
                            "w-full pl-12 pr-12 py-2.5 bg-transparent border-0 outline-0",
                            "text-foreground placeholder:text-muted-foreground",
                            "transition-all duration-200"
                        )}
                        placeholder={placeholder}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                    />
                    {query && (
                        <button
                            className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
                            onClick={() => {
                                setQuery("");
                                setIsOpen(false);
                                searchRef.current?.focus();
                            }}
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={cn(
                        "absolute top-full left-0 right-0 mt-2 z-50",
                        "bg-background border border-search-border rounded-xl",
                        "shadow-lg backdrop-blur-sm max-h-[60vh] overflow-y-auto"
                    )}
                >
                    <div className="p-2">
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                            </div>
                        )}

                        {hasResults && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                                    <Search className="w-4 h-4" />
                                    Search Results ({data?.products?.length})
                                </div>
                                <div className="space-y-1">
                                    {data?.products?.map((product: ProductSearch, idx: number) => (
                                        <ProductCard key={idx} product={product} onProductSelect={handleProductSelect} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasNoResults && (
                            <div className="text-center py-8">
                                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No products found for {query}</p>
                                <p className="text-sm text-muted-foreground mt-1">Try searching for something else</p>
                            </div>
                        )}

                        {showSuggestions && (
                            <>
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
                                                    onClick={() => handleRecentSearchClick(search)}
                                                >
                                                    <span className="text-sm text-foreground">{search}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showSuggestions && (
                                    <div className={`p-2 border-divider ${data?.products?.length ? "border-t" : ""}`}>
                                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide flex items-center gap-2 text-default-500">
                                            <Clock className="w-3 h-3" />
                                            Suggestions
                                        </div>
                                        {data?.suggestions.map((suggestion: string, idx: number) => (
                                            <button
                                                key={idx}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 text-left text-sm"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                <Search className="w-4 h-4 flex-shrink-0 opacity-50" />
                                                <span className="flex-1">{suggestion}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                                        <TrendingUp className="w-4 h-4" />
                                        Trending Products
                                    </div>
                                    <div className="space-y-1">
                                        {trendingData?.products?.map((product: ProductSearch, idx: number) => (
                                            <ProductCard key={idx} product={product} onProductSelect={handleProductSelect} />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                                        <Star className="w-4 h-4" />
                                        Recommended for You
                                    </div>
                                    <div className="space-y-1">
                                        {recommendedData?.recommendations?.map((product: ProductSearch, idx: number) => (
                                            <ProductCard key={idx} product={product} onProductSelect={handleProductSelect} />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSearchClient;
