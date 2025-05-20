import { Metadata } from "next";
import React from "react";

import { ProductInventory } from "@/components/products/product-inventory";
import ClientOnly from "@/components/generic/client-only";

export const metadata: Metadata = {
    title: "Products",
};

export default async function ProductsPage() {
    return (
        <ClientOnly>
            <ProductInventory />
        </ClientOnly>
    );
}
