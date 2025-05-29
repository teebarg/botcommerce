import { notFound } from "next/navigation";
import React from "react";

import RelatedProducts from "@/components/store/products/related-products";
import { api } from "@/apis";
import ServerError from "@/components/generic/server-error";
import ProductView from "@/components/store/products/product-view";
import ReviewsSection from "@/components/product/product-reviews";
import { auth } from "@/actions/auth";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: product, error } = await api.product.get(slug);

    if (error || !product) {
        return {};
    }

    return {
        title: product.name,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images?.[0].image ? [product.images?.[0].image] : [],
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${slug}`,
        },
    };
}

export default async function ProductPage({ params }: { params: Params }) {
    const { slug } = await params;
    const user = await auth();

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
            {user && <ReviewsSection product_id={product.id} />}

            <div className="max-w-7xl mx-1 md:mx-auto px-2 md:px-6 my-4 w-full" data-testid="related-products">
                <RelatedProducts product={product} />
            </div>
        </div>
    );
}
