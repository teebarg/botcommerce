import { notFound } from "next/navigation";
import React from "react";

import RelatedProducts from "@/components/store/products/related-products";
import { serverApi } from "@/apis/server-client";
import ServerError from "@/components/generic/server-error";
import ProductView from "@/components/store/products/product-view";
import ReviewsSection from "@/components/product/product-reviews";
import { tryCatch } from "@/lib/try-catch";
import { Product } from "@/schemas";
import { LazyFadeIn } from "@/components/LazyFadeIn";
import RecentlyViewedSection from "@/components/store/home/recently-viewed";
import { Metadata } from "next";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    const { data: product, error } = await tryCatch<Product>(serverApi.get(`/product/${slug}`));

    if (error || !product) {
        return {};
    }

    return {
        title: product.name,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${slug}`,
            type: "website",
            siteName: "YourShop",
            images: [
                {
                    url: product?.images?.[0]?.image,
                    width: 800,
                    height: 600,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description,
            images: [product?.images?.[0]?.image],
        },
    };
}

export default async function ProductPage({ params }: { params: Params }) {
    const { slug } = await params;

    const { data: product, error } = await tryCatch<Product>(serverApi.get(`/product/${slug}`));

    if (error) {
        return <ServerError />;
    }

    if (!product) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-y-8">
            <ProductView product={product} />
            <LazyFadeIn delay={100}>
                <ReviewsSection productName={product?.name} product_id={product?.id} />
            </LazyFadeIn>

            <div className="max-w-7xl mx-1 md:mx-auto px-2 md:px-6 my-4 w-full" data-testid="related-products">
                <LazyFadeIn delay={200}>
                    <RelatedProducts product={product} />
                </LazyFadeIn>
            </div>

            <LazyFadeIn delay={300}>
                <RecentlyViewedSection showBanner={false} />
            </LazyFadeIn>
        </div>
    );
}
