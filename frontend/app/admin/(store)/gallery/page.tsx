import { Metadata } from "next";
import React from "react";

import { ProductImageGallery } from "@/components/admin/product/product-image-gallery";

export const metadata: Metadata = {
    title: "Gallery",
};

export default async function ProductsPage() {
    return <ProductImageGallery />;
}
