import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";

import { siteConfig } from "@/lib/config";
import { api } from "@/apis";
import ServerError from "@/components/server-error";
import ProductView from "@/components/store/products/product-view";
import { Skeleton } from "@/components/skeleton";
import ReviewsSection from "@/components/product/product-reviews";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: product, error } = await api.product.get(slug);

    if (error || !product) {
        return {};
    }

    return {
        title: `${product.name} | ${siteConfig.name} Store`,
        description: `${product.description}`,
        openGraph: {
            title: `${product.name} | ${siteConfig.name} Store`,
            description: `${product.description}`,
            images: product.image ? [product.image] : [],
        },
    };
}

export default async function ProductPage({ params }: { params: Params }) {
    const { slug } = await params;

    const { data: product, error } = await api.product.get(slug);

    if (error) {
        return <ServerError />;
    }

    if (!product) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-y-8">
            <ProductView product={product} />

            {/* ReviewSection */}
            <Suspense fallback={<Skeleton className="h-48" />}>
                <ReviewsSection product_id={product.id} />
            </Suspense>

            <div className="max-w-7xl mx-1 md:mx-auto px-2 md:px-6 my-4 w-full" data-testid="related-products-container">
                <Suspense fallback={<SkeletonRelatedProducts />}>
                    <RelatedProducts product={product} />
                </Suspense>
            </div>
        </div>
    );
}
