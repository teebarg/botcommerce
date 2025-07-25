"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, Clock, TrendingUp, SlidersHorizontal, Star, ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { tryCatchApi } from "@/lib/try-catch";
import { api } from "@/apis/client2";
import { PaginatedProductSearch, ProductSearch } from "@/schemas";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { useUserCreateWishlist, useUserDeleteWishlist } from "@/lib/hooks/useUser";
import { useTrackUserInteraction } from "@/lib/hooks/useUserInteraction";
import { useAuth } from "@/providers/auth-provider";

const ProductCard: React.FC<{ product: ProductSearch }> = ({ product }) => {
    const {
        priceInfo,
        selectedColor,
        selectedSize,
        quantity,
        selectedVariant,
        setQuantity,
        sizes,
        colors,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        loading,
        outOfStock,
    } = useProductVariant(product);

    const { mutate: createWishlist } = useUserCreateWishlist();
    const { mutate: deleteWishlist } = useUserDeleteWishlist();

    const { user } = useAuth();
    const trackInteraction = useTrackUserInteraction();

    useEffect(() => {
        if (user && product?.id) {
            trackInteraction.mutate({
                user_id: user.id,
                product_id: product.id,
                type: "VIEW",
                metadata: { source: "product-overview" },
            });
        }

        const startTime = Date.now();

        return () => {
            const timeSpent = Date.now() - startTime;

            if (user && product?.id) {
                trackInteraction.mutate({
                    user_id: user.id,
                    product_id: product.id,
                    type: "VIEW",
                    metadata: { timeSpent, source: "product-overview" },
                });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, product?.id]);

    const handleAddToCartAndTrack = () => {
        if (user && product?.id) {
            trackInteraction.mutate({
                user_id: user.id,
                product_id: product.id,
                type: "CART_ADD",
                metadata: { source: "product-overview" },
            });
        }
        handleAddToCart();
    };

    const handleProductClick = (product: ProductSearch) => {
        if (onProductSelect) {
            onProductSelect(product);
        }
    };

    return (
        <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="relative mb-4">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleProductClick(product)}>
                    <img
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        src={product.images[0] || product.image || "/placeholder.jpg"}
                    />
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400" style={{ display: "none" }}>
                        📦
                    </div>
                </div>
                {outOfStock && <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Out of Stock</div>}
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 truncate cursor-pointer hover:text-blue-600" onClick={() => handleProductClick(product)}>
                {product.name}
            </h3>

            <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.average_rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-600">({product.average_rating || 0})</span>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">${product.price}</span>
                <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        outOfStock ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    disabled={outOfStock}
                >
                    <ShoppingCart className="w-4 h-4" />
                    {outOfStock ? "Unavailable" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
};

interface ProductSearchClientProps {
    apiBaseUrl?: string;
    initialQuery?: string;
    onProductSelect?: (product: ProductSearch) => void;
    customHeaders?: Record<string, string>;
    enableRecommendations?: boolean;
    enableSimilarProducts?: boolean;
    searchDelay?: number;
}

const ProductSearchClient: React.FC<ProductSearchClientProps> = ({
    apiBaseUrl = "/api",
    initialQuery = "",
    onProductSelect,
    customHeaders = {},
    enableRecommendations = true,
    enableSimilarProducts = true,
    searchDelay = 300,
}) => {
    const [query, setQuery] = useState(initialQuery);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
    const [sortBy, setSortBy] = useState<string>("relevance");
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // API state
    const [products, setProducts] = useState<ProductSearch[]>([]);
    const [suggestions, setSuggestions] = useState<ProductSearch[]>([]);
    const [recommendations, setRecommendations] = useState<ProductSearch[]>([]);
    const [similarProducts, setSimilarProducts] = useState<ProductSearch[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState<number>(0);

    const searchRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isLiked = true;

    const categories = [
        { id: "all", name: "All Categories" },
        { id: "electronics", name: "Electronics" },
        { id: "clothing", name: "Clothing" },
        { id: "home", name: "Home & Garden" },
        { id: "sports", name: "Sports" },
        { id: "books", name: "Books" },
        { id: "beauty", name: "Beauty" },
    ];

    // Search products
    const searchProducts = useCallback(
        async (searchQuery: string, filters: any = {}) => {
            if (!searchQuery.trim()) {
                setProducts([]);
                setTotalResults(0);

                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params: any = {
                    q: searchQuery,
                    category: filters.category !== "all" ? filters.category : undefined,
                    min_price: filters.priceRange?.[0],
                    max_price: filters.priceRange?.[1],
                    sort: filters.sortBy,
                    limit: 20,
                    offset: 0,
                };

                const { data, error } = await tryCatchApi<PaginatedProductSearch>(api.get("/products/search", params));

                if (error) {
                    setError(error);
                    setProducts([]);
                    setTotalResults(0);

                    return;
                }

                setProducts(data?.products || []);
                setTotalResults(data?.total_count || 0);

                // Add to search history
                if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
                    setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)]);
                }
            } catch (error) {
                setError("Failed to search products. Please try again.");
                setProducts([]);
                setTotalResults(0);
            } finally {
                setLoading(false);
            }
        },
        [apiBaseUrl, customHeaders, recentSearches]
    );

    // Get search suggestions
    const getSuggestions = useCallback(
        async (searchQuery: string) => {
            if (!searchQuery.trim() || searchQuery.length < 2) {
                setSuggestions([]);

                return;
            }

            setSuggestionsLoading(true);

            const { data, error } = await tryCatchApi<ProductSearch>(
                api.get("/products/search", {
                    params: {
                        q: searchQuery,
                        limit: 6,
                    },
                })
            );

            setSuggestionsLoading(false);

            if (error) {
                toast.error(error);
                setError(error);
                setSuggestions([]);

                return;
            }

            // setSuggestions(data.suggestions || data.products?.slice(0, 6) || []);
        },
        [apiBaseUrl, customHeaders]
    );

    // Get recommendations
    const getRecommendations = useCallback(async () => {
        if (!enableRecommendations) return;

        const { data, error } = await tryCatchApi<ProductSearch[]>(
            api.get("/products/recommendation", {
                params: {
                    limit: 8,
                    user_id: localStorage.getItem("userId"), // Optional user context
                },
            })
        );

        if (error) {
            console.error("Failed to get recommendations:", error);
        }

        setRecommendations(data || []);
    }, [apiBaseUrl, customHeaders, enableRecommendations]);

    // Get similar products
    const getSimilarProducts = useCallback(
        async (productId: string) => {
            if (!enableSimilarProducts) return;

            const { data, error } = await tryCatchApi<ProductSearch[]>(
                api.get("/products/similar", {
                    params: {
                        product_id: productId,
                        limit: 4,
                    },
                })
            );

            if (error) {
                console.error("Failed to get similar products:", error);
            }

            setSimilarProducts((prev) => ({
                ...prev,
                [productId]: data || [],
            }));
        },
        [apiBaseUrl, customHeaders, enableSimilarProducts]
    );

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (query) {
                searchProducts(query, {
                    category: selectedCategory,
                    priceRange,
                    sortBy,
                });
            }
        }, searchDelay);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query, selectedCategory, priceRange, sortBy, searchProducts, searchDelay]);

    // Debounced suggestions
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            getSuggestions(query);
        }, 200);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query, getSuggestions]);

    // Load recommendations on mount
    useEffect(() => {
        getRecommendations();

        // Load search history from localStorage
        const savedHistory = localStorage.getItem("searchHistory");

        if (savedHistory) {
            setRecentSearches(JSON.parse(savedHistory));
        }
    }, [getRecommendations]);

    // Save search history to localStorage
    useEffect(() => {
        localStorage.setItem("searchHistory", JSON.stringify(recentSearches));
    }, [recentSearches]);

    // Handle search
    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        setIsOpen(false);

        if (onProductSelect && typeof onProductSelect === "function") {
            onProductSelect({ type: "search", query: searchQuery });
        }
    };

    // Handle product click
    const handleProductClick = (product: ProductSearch) => {
        if (enableSimilarProducts) {
            getSimilarProducts(product.id);
        }

        if (onProductSelect && typeof onProductSelect === "function") {
            onProductSelect({ type: "product", product });
        }
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter products client-side for additional filtering
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

            return matchesPrice;
        });
    }, [products, priceRange]);

    return (
        <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
            {/* Search Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Search Bar */}
                    <div ref={dropdownRef} className="relative flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                ref={searchRef}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                                placeholder="Search for products..."
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setIsOpen(true);
                                }}
                                onFocus={() => setIsOpen(true)}
                            />
                            {query && (
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                        setQuery("");
                                        setIsOpen(false);
                                        setProducts([]);
                                        setTotalResults(0);
                                        searchRef.current?.focus();
                                    }}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Search Dropdown */}
                        {isOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                {/* Recent Searches */}
                                {!query && recentSearches.length > 0 && (
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Recent Searches
                                        </h3>
                                        <div className="space-y-1">
                                            {recentSearches.map((search, index) => (
                                                <button
                                                    key={index}
                                                    className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                                                    onClick={() => handleSearch(search)}
                                                >
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {!query && recommendations.length > 0 && (
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Recommended for You
                                        </h3>
                                        <div className="space-y-2">
                                            {recommendations.slice(0, 4).map((product) => (
                                                <button
                                                    key={product.id}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                                                    onClick={() => {
                                                        handleSearch(product.name);
                                                        handleProductClick(product);
                                                    }}
                                                >
                                                    <img
                                                        alt={product.name}
                                                        className="w-8 h-8 object-cover rounded"
                                                        src={product.images[0] || product.image || "/placeholder.jpg"}
                                                    />
                                                    <div
                                                        className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500"
                                                        style={{ display: "none" }}
                                                    >
                                                        IMG
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                                                        <div className="text-xs text-gray-500">${product.price}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Product Suggestions */}
                                {query && (
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            Products
                                            {suggestionsLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                        </h3>
                                        {suggestionsLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            <div className="space-y-2">
                                                {suggestions.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                                                        onClick={() => {
                                                            handleSearch(product.name);
                                                            handleProductClick(product);
                                                        }}
                                                    >
                                                        <img
                                                            alt={product.name}
                                                            className="w-8 h-8 object-cover rounded"
                                                            src={product.images[0] || product.image || "/placeholder.jpg"}
                                                        />
                                                        <div
                                                            className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500"
                                                            style={{ display: "none" }}
                                                        >
                                                            IMG
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                                                            <div className="text-xs text-gray-500">${product.price}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : query.length >= 2 ? (
                                            <div className="text-center text-gray-500 py-2">No suggestions found for "{query}"</div>
                                        ) : (
                                            <div className="text-center text-gray-500 py-2">Type at least 2 characters to see suggestions</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <button
                        className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                            showFilters ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1"
                                        max="2000"
                                        min="0"
                                        type="range"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                    />
                                    <input
                                        className="flex-1"
                                        max="2000"
                                        min="0"
                                        type="range"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    />
                                </div>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="name">Name A-Z</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>

                            {/* Stock Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input defaultChecked className="rounded border-gray-300" type="checkbox" />
                                        <span className="text-sm text-gray-700">In Stock</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input className="rounded border-gray-300" type="checkbox" />
                                        <span className="text-sm text-gray-700">Out of Stock</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="text-gray-600 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {totalResults > 0 ? (
                        <>
                            Showing {filteredProducts.length} of {totalResults} result{totalResults !== 1 ? "s" : ""}
                        </>
                    ) : query && !loading ? (
                        <>No results found</>
                    ) : !query ? (
                        <>Enter a search term to find products</>
                    ) : null}
                    {query && (
                        <>
                            {" "}
                            for &rdquo;<span className="font-medium text-gray-900">{query}</span>&rdquo;
                        </>
                    )}
                </div>

                {query && (
                    <button
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                        onClick={() => {
                            setQuery("");
                            setSelectedCategory("all");
                            setPriceRange([0, 1000]);
                            setSortBy("relevance");
                            setProducts([]);
                            setTotalResults(0);
                            setError(null);
                        }}
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Searching products...</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && query && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search terms or filters to find what you&rsquo;re looking for.</p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => {
                            setQuery("");
                            setSelectedCategory("all");
                            setPriceRange([0, 1000]);
                            setProducts([]);
                            setTotalResults(0);
                            setError(null);
                        }}
                    >
                        Reset Search
                    </button>
                </div>
            )}

            {/* No Query State */}
            {!query && recommendations.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Amazing Products</h3>
                    <p className="text-gray-600">{`Start typing in the search box to find products you'll love.`}</p>
                </div>
            )}
        </div>
    );
};

export default ProductSearchClient;
