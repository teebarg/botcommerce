"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/apis";
import { Product, ProductVariant } from "@/lib/models";
import { BtnLink } from "@/components/ui/btnLink";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { currency } from "@/lib/util/util";
import { ChevronRight } from "nui-react-icons";
import LocalizedClientLink from "@/components/ui/link";

interface ProductViewProps {
    product: Product;
    user: any;
}

export default function ProductView({ product, user }: ProductViewProps) {
    const router = useRouter();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    // Group variants by their attributes
    const variantGroups = product.variants.reduce((acc: { [key: string]: string[] }, variant) => {
        if (!variant.attributes) return {}
        Object.entries(variant.attributes).forEach(([key, value]) => {
            if (!acc[key]) {
                acc[key] = [];
            }
            if (!acc[key].includes(value)) {
                acc[key].push(value);
            }
        });
        return acc;
    }, {});

    const handleVariantSelect = (attribute: string, value: string) => {
        const newAttributes = selectedVariant?.attributes || {};
        newAttributes[attribute] = value;

        // Find matching variant
        const matchingVariant = product.variants.find(variant => 
            Object.entries(newAttributes).every(([key, val]) => variant.attributes[key] === val)
        );

        setSelectedVariant(matchingVariant || null);
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error("Please select a variant");
            return;
        }

        setLoading(true);
        try {
            const response = await api.cart.add({
                variant_id: selectedVariant.id,
                quantity,
            });

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success("Added to cart successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <nav className="mb-8" data-slot="base">
                <ol className="flex flex-wrap list-none rounded-lg" data-slot="list">
                    <li className="flex items-center" data-slot="base">
                        <LocalizedClientLink href="/">Home</LocalizedClientLink>
                        <span className="px-1 text-foreground/50" data-slot="separator">
                            <ChevronRight />
                        </span>
                    </li>
                    <li className="flex items-center" data-slot="base">
                        <LocalizedClientLink href="/collections">Collections</LocalizedClientLink>
                        <span className="px-1 text-foreground/50" data-slot="separator">
                            <ChevronRight />
                        </span>
                    </li>
                    <li className="flex items-center" data-slot="base">
                        <span>{product.name}</span>
                    </li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative aspect-square">
                    <Image
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                        priority
                    />
                </div>

                {/* Product Details */}
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-600">{product.description}</p>
                    
                    <div className="text-2xl font-bold">
                        {selectedVariant ? currency(selectedVariant.price) : currency(product.price)}
                    </div>

                    {/* Variant Selection */}
                    {Object.entries(variantGroups).map(([attribute, values]) => (
                        <div key={attribute} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {attribute}
                            </label>
                            <Select
                                value={selectedVariant?.attributes[attribute]}
                                onValueChange={(value) => handleVariantSelect(attribute, value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${attribute}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {values.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}

                    {/* Quantity Selection */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Quantity:</label>
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </Button>
                            <span className="px-4">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={loading || !selectedVariant}
                        className="w-full"
                    >
                        {loading ? "Adding to cart..." : "Add to Cart"}
                    </Button>

                    {/* Additional Product Info */}
                    <div className="mt-8 space-y-4">
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Product Details</h3>
                            <p className="text-gray-600">{product.description}</p>
                        </div>
                        {/* {product.specifications && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Specifications</h3>
                                <ul className="list-disc list-inside text-gray-600">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <li key={key}>
                                            <span className="font-medium">{key}:</span> {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        </div>
    );
} 