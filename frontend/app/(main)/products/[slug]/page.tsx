import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import ProductActions from "@modules/products/components/product-actions";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { ArrowUpRightMini, ChevronRight, Delivery } from "nui-react-icons";
import Image from "next/image";

import { siteConfig } from "@/lib/config";
import SkeletonProductTemplate from "@/modules/products/skeleton-product";
import { currency } from "@/lib/util/util";
import ProductDetails from "@/modules/products/templates/details";
import LocalizedClientLink from "@/components/ui/link";
import ReviewsSection from "@/components/product/product-reviews";
import { Skeleton } from "@/components/skeleton";
import { api } from "@/apis";
import ServerError from "@/components/server-error";

type Params = Promise<{ slug: string }>;

// export async function generateStaticParams() {
//     return [];
// }

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const product = await api.product.get(slug);

    if (!product) {
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
    const product = await api.product.get(slug);

    if (product == null) {
        return <ServerError />;
    }

    if (!product) {
        notFound();
    }

    return (
        <Suspense fallback={<SkeletonProductTemplate />}>
            <React.Fragment>
                <div className="sticky top-14 z-50 w-full px-8 py-4 bg-background shadow-xl md:hidden">
                    <ProductActions btnClassName="font-semibold bg-rose-500 text-white" className="w-full" product={product} showPrice={false} />
                </div>
                <div className="max-w-7xl mx-auto h-full w-full md:my-8">
                    <nav className="hidden md:block mb-4" data-slot="base">
                        <ol className="flex flex-wrap list-none rounded-lg" data-slot="list">
                            <li className="flex items-center" data-slot="base">
                                <LocalizedClientLink href="/">Home</LocalizedClientLink>
                            </li>
                            <li className="flex items-center" data-slot="base">
                                <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                    <ChevronRight />
                                </span>
                                <LocalizedClientLink href="/collections">Collection</LocalizedClientLink>
                            </li>
                            {product?.name && (
                                <li className="flex items-center" data-slot="base">
                                    <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                        <ChevronRight />
                                    </span>
                                    <span>{product.name}</span>
                                </li>
                            )}
                        </ol>
                    </nav>
                    <div className="relative flex flex-col lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                        <div className="relative h-full w-full flex-none flex flex-col-reverse md:flex-row gap-2 md:gap-4">
                            <div className="flex md:flex-col gap-4 px-2 md:px-0">
                                {product?.images?.map((image: any, index: number) => (
                                    <div key={index} className="w-[80px] h-[120px] relative rounded-lg overflow-hidden">
                                        <Image fill alt={`Product ${index + 1}`} src={image.image} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1">
                                <div className="h-[60vh] relative rounded-lg overflow-hidden">
                                    {product.image && <Image fill alt={product.name} src={product.image} />}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col px-2 md:px-0 mt-6 md:mt-0">
                            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                            <div className="my-2 flex items-center gap-2">
                                <p className="text-sm text-default-500">{product?.reviews?.length || 0} reviews</p>
                            </div>
                            <div className="bg-orange-800 py-4 px-4 md:hidden -mx-2">
                                <div className="flex items-center text-white">
                                    <span className="text-3xl font-semibold ">{currency(product.price)}</span>
                                    {product.old_price > product.price && (
                                        <span className="ml-1 text-sm line-through">{currency(product.old_price)}</span>
                                    )}
                                </div>
                                {product.old_price > product.price && (
                                    <div className="mt-1 -mb-1.5">
                                        <span className="text-xl font-medium text-orange-400">
                                            Save {(((product.old_price - product.price) / product.old_price) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="max-w-40 mt-2 hidden md:block">
                                <Suspense fallback={<ProductActions disabled={true} product={product} />}>
                                    <ProductActions product={product} showDetails={false} />
                                </Suspense>
                            </div>
                            <div className="mt-4">
                                <p className="line-clamp-3 text-base text-default-500">{product.description}</p>
                            </div>
                            <div className="mt-6 flex flex-col gap-1">
                                <div className="mb-4 flex items-center gap-2 text-default-900">
                                    <Delivery />
                                    <p className="text-sm font-medium">Free shipping and 30 days return</p>
                                </div>
                                <LocalizedClientLink
                                    className="inline-flex items-center text-sm hover:opacity-80 transition-opacity my-2 text-default-500"
                                    href={"/"}
                                >
                                    See guide
                                    <ArrowUpRightMini />
                                </LocalizedClientLink>
                            </div>
                            <ProductDetails product={product} />
                        </div>
                    </div>
                </div>
                {/* ReviewSection */}
                <Suspense fallback={<Skeleton className="h-44" />}>
                    <ReviewsSection product={product} />
                </Suspense>

                <div className="max-w-7xl mx-1 md:mx-auto px-2 md:px-6 my-4" data-testid="related-products-container">
                    <Suspense fallback={<SkeletonRelatedProducts />}>
                        <RelatedProducts product={product} />
                    </Suspense>
                </div>
            </React.Fragment>
        </Suspense>
    );
}
