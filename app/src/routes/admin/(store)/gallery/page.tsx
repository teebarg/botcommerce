import { Metadata } from "next";

import { ProductImageGallery } from "@/components/admin/product/product-image-gallery";

export const metadata: Metadata = {
    title: "Gallery",
};

export default async function ProductsPage() {
    return <ProductImageGallery />;
}
