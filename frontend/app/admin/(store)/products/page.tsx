import { Metadata } from "next";
import React from "react";

import { ProductInventory } from "@/components/products/product-inventory";

export const metadata: Metadata = {
    title: "Products",
};

export default async function ProductsPage() {
    return <ProductInventory />;
}
