import React, { useState, useEffect } from "react";
import { Plus, Package, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSearch } from "@/schemas";

interface ProductSelectorProps {
    onAddProduct: (product: ProductSearch) => void;
}

// Mock API call function
const searchProducts = async (query: string): Promise<ProductSearch[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [];
};

export const ProductSearchComponent: React.FC<ProductSelectorProps> = ({ onAddProduct }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ProductSearch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

    // Load initial products
    useEffect(() => {
        loadInitialProducts();
    }, []);

    // Search on query change
    useEffect(() => {
        if (isSearching) {
            handleSearch(searchQuery);
        }
    }, [searchQuery, isSearching]);

    const loadInitialProducts = async () => {
        setIsLoading(true);
        try {
            const products = await searchProducts("");

            setSearchResults(products);
        } catch (error) {
            console.error("Failed to load products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        try {
            const results = await searchProducts(query);

            setSearchResults(results);
        } catch (error) {
            console.error("Failed to search products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectProduct = (product: ProductSearch) => {
        onAddProduct(product);
        setSelectedProducts((prev) => new Set([...prev, product.id]));

        toast.success("Product Added! 🎉", {
            description: `${product.name} has been added to your collection`,
        });
    };

    const toggleSearch = () => {
        setIsSearching(!isSearching);
        if (!isSearching) {
            setSearchQuery("");
        }
    };

    if (!isSearching) {
        return (
            <Button
                className="w-full h-16 border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
                type="button"
                variant="outline"
                onClick={toggleSearch}
            >
                <div className="flex items-center gap-3 text-primary">
                    <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-base font-medium">Search Products</span>
                </div>
            </Button>
        );
    }

    return (
        <Card className="border-2 border-primary/20 bg-primary/5 shadow-soft">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Package className="h-5 w-5" />
                        Search Products
                    </div>
                    <Button className="text-muted-foreground hover:text-foreground" size="sm" type="button" variant="ghost" onClick={toggleSearch}>
                        Cancel
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            autoFocus
                            className="pl-10 bg-background"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Searching products...
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {searchResults.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No products found</p>
                                    <p className="text-sm">Try different search terms</p>
                                </div>
                            ) : (
                                searchResults.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 animate-fade-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        {product.images.length > 0 && (
                                            <div className="flex-shrink-0">
                                                <img
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-border/30"
                                                    loading="lazy"
                                                    src={product.images[0]}
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate mb-1">{product.description}</p>
                                            <p className="text-lg font-semibold text-primary">${product.price}</p>
                                        </div>

                                        <Button
                                            className="ml-4 shrink-0"
                                            disabled={selectedProducts.has(product.id)}
                                            size="sm"
                                            type="button"
                                            variant={selectedProducts.has(product.id) ? "secondary" : "default"}
                                            onClick={() => handleSelectProduct(product)}
                                        >
                                            {selectedProducts.has(product.id) ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Added
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {searchResults.length > 0 && (
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
                        Found {searchResults.length} product{searchResults.length !== 1 ? "s" : ""}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
