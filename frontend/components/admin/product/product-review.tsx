import type { Product } from "./product-creator";

import { Package, DollarSign, Tag, Image as ImageIcon, Palette, Ruler, Shirt } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProductReviewProps {
    product: Product;
    onCreateProduct: () => void;
}

export function ProductReview({ product, onCreateProduct }: ProductReviewProps) {
    const { images, details, variants } = product;

    const getVariantIcon = (type: string) => {
        switch (type) {
            case "size":
                return Ruler;
            case "color":
                return Palette;
            case "style":
                return Shirt;
            default:
                return Package;
        }
    };

    const calculateTotalVariants = () => {
        return variants.reduce((total, variant) => total + variant.stock, 0);
    };

    const hasPositivePriceModifiers = variants.some((v) => v.priceModifier > 0);
    const hasNegativePriceModifiers = variants.some((v) => v.priceModifier < 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Review Your Product</h2>
                <p className="text-muted-foreground">Double-check all information before creating your product. You can always edit it later.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Product Preview */}
                <Card className="p-6 bg-gradient-card shadow-medium">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-card-foreground">Product Preview</h3>
                        </div>

                        {/* Main Image */}
                        {images.length > 0 && (
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                <img alt="Main product image" className="w-full h-full object-cover" src={images[0].url} />
                            </div>
                        )}

                        {/* Product Info */}
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-lg font-semibold text-card-foreground">{details.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl font-bold text-primary">${details.price.toFixed(2)}</span>
                                    {hasPositivePriceModifiers && (
                                        <span className="text-sm text-muted-foreground">
                                            - ${(details.price + Math.max(...variants.map((v) => v.priceModifier))).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {details.category && (
                                <Badge className="w-fit" variant="secondary">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {details.category}
                                </Badge>
                            )}

                            {details.description && <p className="text-muted-foreground text-sm leading-relaxed">{details.description}</p>}

                            {details.sku && (
                                <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">SKU: {details.sku}</div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Summary Details */}
                <div className="space-y-4">
                    {/* Images Summary */}
                    <Card className="p-4 bg-gradient-card shadow-soft">
                        <div className="flex items-center gap-2 mb-3">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-card-foreground">Images</h4>
                            <Badge variant="outline">{images.length}</Badge>
                        </div>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((image, index) => (
                                    <div key={image.id} className="aspect-square rounded overflow-hidden bg-muted relative">
                                        <img alt={`Product image ${index + 1}`} className="w-full h-full object-cover" src={image.url} />
                                        {index === 0 && <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">Main</div>}
                                    </div>
                                ))}
                                {images.length > 4 && (
                                    <div className="aspect-square rounded bg-muted flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground">+{images.length - 4}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No images uploaded</p>
                        )}
                    </Card>

                    {/* Basic Info Summary */}
                    <Card className="p-4 bg-gradient-card shadow-soft">
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-card-foreground">Product Details</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium text-card-foreground">{details.name || "Not set"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-medium text-card-foreground">${details.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="font-medium text-card-foreground">{details.category || "Not set"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">SKU:</span>
                                <span className="font-mono text-xs text-card-foreground">{details.sku || "Not set"}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Variants Summary */}
                    <Card className="p-4 bg-gradient-card shadow-soft">
                        <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-card-foreground">Variants</h4>
                            <Badge variant="outline">{variants.length}</Badge>
                        </div>
                        {variants.length > 0 ? (
                            <div className="space-y-2">
                                <div className="text-xs text-muted-foreground mb-2">Total stock: {calculateTotalVariants()} units</div>
                                {variants.slice(0, 3).map((variant) => {
                                    const Icon = getVariantIcon(variant.type);

                                    return (
                                        <div key={variant.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-card-foreground">{variant.name}</span>
                                                <Badge className="text-xs" variant="secondary">
                                                    {variant.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {variant.priceModifier !== 0 && (
                                                    <span className={variant.priceModifier > 0 ? "text-success" : "text-warning"}>
                                                        {variant.priceModifier > 0 ? "+" : ""}${variant.priceModifier.toFixed(2)}
                                                    </span>
                                                )}
                                                <span>Stock: {variant.stock}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {variants.length > 3 && <p className="text-xs text-muted-foreground">+{variants.length - 3} more variants</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No variants created</p>
                        )}
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Final Actions */}
            <Card className="p-6 bg-accent/30 border border-success/20">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-card-foreground">Ready to Create Product?</h3>
                        <p className="text-sm text-muted-foreground">Your product will be added to your catalog and will be ready for customers.</p>
                    </div>
                    <Button
                        className="bg-gradient-primary hover:shadow-medium transition-all duration-smooth w-full sm:w-auto"
                        size="lg"
                        onClick={onCreateProduct}
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Create Product
                    </Button>
                </div>
            </Card>
        </div>
    );
}
