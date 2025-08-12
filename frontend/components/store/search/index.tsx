"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { ProductSearch } from "@/schemas/product";
import ProductSearchClient from "@/components/store/products/product-search";

interface SearchProps {
    className?: string;
}

const Search: React.FC<SearchProps> = ({ className }) => {
    const router = useRouter();
    const onProductSelect = (product: ProductSearch) => {
        router.push(`/products/${product.slug}`);
    };

    return <ProductSearchClient onProductSelect={onProductSelect} />;
};

export default Search;
