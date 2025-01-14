import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, search } from "@lib/data";
import ProductTemplate from "@modules/products/templates";
import { Product, SearchParams } from "types/global";
import { Suspense } from "react";

import SkeletonProductTemplate from "@/modules/products/skeleton-product";
import { siteConfig } from "@/lib/config";

export const revalidate = 2;

type Props = {
    params: { slug: string };
};

export async function generateStaticParams() {
    const queryParams: SearchParams = {
        limit: 100,
    };

    const { products } = await search(queryParams);

    return products.map((product: Product) => ({
        slug: String(product.slug),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = await getProductBySlug(params.slug);

    if (!product) {
        notFound();
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

export default async function ProductPage({ params }: Props) {
    const product = await getProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    return (
        <Suspense fallback={<SkeletonProductTemplate />}>
            <ProductTemplate product={product} />
        </Suspense>
    );
}
