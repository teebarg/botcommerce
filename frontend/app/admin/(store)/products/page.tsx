import { Metadata } from "next";
import React from "react";

import { ProductInventory } from "@/components/products/product-inventory";
import ClientOnly from "@/components/client-only";

export const metadata: Metadata = {
    title: "Children clothing",
};

export default async function ProductsPage() {
    return (
        <ClientOnly>
            <ProductInventory />
        </ClientOnly>
    );
}
