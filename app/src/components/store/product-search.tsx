import { useState, useEffect, useRef } from "react";
import { Clock, Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useOverlayTriggerState } from "react-stately";
import type { ProductSearch } from "@/schemas";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/utils";
import { useProductSearch } from "@/hooks/useProduct";
import { Separator } from "@/components/ui/separator";
import LocalizedClientLink from "@/components/ui/link";
import { useNavigate } from "@tanstack/react-router";
import ProductCardPLP from "./products/product-card-plp";

interface SearchDialogProps {
    initialQuery?: string;
    searchDelay?: number;
    placeholder?: string;
}

export const SearchDialog = ({ initialQuery = "", searchDelay = 500, placeholder = "Search for products..." }: SearchDialogProps) => {
    const searchState = useOverlayTriggerState({});
    const navigate = useNavigate();
    const [query, setQuery] = useState<string>(initialQuery);
    const [debouncedQuery] = useDebounce(query, searchDelay);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useProductSearch({ search: debouncedQuery, limit: 4 });
    const { data: trendingData } = useProductSearch({ collections: "trending", limit: 4 });

    useEffect(() => {
        const savedHistory = localStorage.getItem("searchHistory");

        if (savedHistory) {
            setRecentSearches(JSON.parse(savedHistory));
        }
    }, []);

    const handleSearchSubmit = (newSearchTerm: string) => {
        if (!newSearchTerm.trim()) return;

        setRecentSearches((prev) => {
            const updated = [newSearchTerm, ...prev.filter(i => i !== newSearchTerm)].slice(0, 10);
            localStorage.setItem("searchHistory", JSON.stringify(updated));
            return updated;
        });

        navigate({ to: `/search/${encodeURIComponent(newSearchTerm)}` });
    };

    const hasResults = query.trim() && !!data?.products?.length;
    const hasNoResults = query.trim() && (!data || data?.products?.length === 0) && !isLoading;

    return (
        <Sheet open={searchState.isOpen} onOpenChange={searchState.toggle}>
            <SheetTrigger>
                <div className="bg-card rounded-2xl hidden md:flex items-center gap-1.5 w-96 px-2 py-3">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground text-sm">{query ? query : "Search for products..."}</span>
                </div>
                <div className="rounded-md md:hidden h-10 w-10 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                    <span className="sr-only">Search</span>
                </div>
            </SheetTrigger>
            <SheetContent aria-describedby={undefined} side="top" className="h-screen flex px-2.5">
                <SheetHeader className="sr-only">
                    <SheetTitle>Search Products</SheetTitle>
                    <SheetDescription>Search for products, categories, and more</SheetDescription>
                </SheetHeader>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center rounded-xl border w-full max-w-lg mx-auto relative">
                        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            className={cn(
                                "pl-12 pr-12 py-2.5 bg-transparent border-0 outline-0 w-full",
                                "text-foreground placeholder:text-muted-foreground"
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
                    <div className="flex-1 overflow-y-auto bg-card">
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                            </div>
                        )}
                        {hasResults && (
                            <div className="max-w-8xl mx-auto">
                                <div className="p-4">
                                    <h3 className="font-semibold text-sm tracking-wider mb-4">PRODUCTS</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                        {data?.products?.map((product: ProductSearch) => (
                                            <ProductCardPLP key={product.id} product={product} />
                                        ))}
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="text-right">
                                    <LocalizedClientLink
                                        className="inline-block text-left text-sm hover:text-primary transition-colors py-1"
                                        href={`/search/${query}`}
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
                                    <h3 className="font-semibold text-sm tracking-wider mb-4">TRENDING PRODUCTS</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {trendingData?.products?.map((product: ProductSearch) => (
                                            <ProductCardPLP key={product.id} product={product} />
                                        ))}
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
                                            onClick={() => handleSearchSubmit(search)}
                                        >
                                            <span className="text-sm text-foreground">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
