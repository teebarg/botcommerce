import React, { Suspense } from "react";
import ProductActions from "@modules/products/components/product-actions";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { notFound } from "next/navigation";
import { Image } from "@nextui-org/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ArrowUpRightMini, ChevronRightIcon, StarIcon } from "nui-react-icons";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

import ProductDetails from "./details";
import { Product } from "types/global";

type ProductTemplateProps = {
    product: Product;
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({ product }) => {
    if (!product || !product.id) {
        return notFound();
    }

    return (
        <React.Fragment>
            <div className="max-w-7xl mx-auto h-full w-full px-2 lg:px-16 my-8">
                <nav data-slot="base">
                    <ol className="flex flex-wrap list-none rounded-small" data-slot="list">
                        <li className="flex items-center" data-slot="base">
                            <LocalizedClientLink href="/">Home</LocalizedClientLink>
                        </li>
                        <li className="flex items-center" data-slot="base">
                            <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                <ChevronRightIcon />
                            </span>
                            <LocalizedClientLink href="/collections">Collection</LocalizedClientLink>
                        </li>
                        {product?.name && (
                            <li className="flex items-center" data-slot="base">
                                <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                    <ChevronRightIcon />
                                </span>
                                <span>{product.name}</span>
                            </li>
                        )}
                    </ol>
                </nav>
                <div className="relative flex flex-col gap-66 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 mt-4">
                    <div className="relative h-full w-full flex-none">
                        <div className="inline-flex items-center justify-between px-2 text-medium rounded-full absolute left-3 top-3 z-20 h-10 gap-1 bg-background/60 pl-3 pr-2 text-foreground/90 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50">
                            <StarIcon className="max-h-[80%]" height="1em" role="img" width="1em" />
                            <span className="flex-1 text-inherit font-normal px-2 pl-1">Popular</span>
                        </div>
                        <Image
                            alt={product.name}
                            className="h-[60vh]"
                            classNames={{ wrapper: "!max-w-full flex justify-center" }}
                            src={product.image as string}
                        />
                        <ScrollShadow hideScrollBar className="mt-8 w-full" orientation="horizontal">
                            <div className="flex gap-2 w-[800px]">
                                {product?.images?.map((image: any, index: number) => (
                                    <Image key={image.id} alt={`Product image ${index + 1}`} className="w-[200px] h-[150px]" src={image.url} />
                                ))}
                            </div>
                        </ScrollShadow>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                        <div className="my-2 flex items-center gap-2">
                            <p className="text-small text-default-400">669 reviews</p>
                        </div>
                        <div className="max-w-40 mt-2">
                            <Suspense fallback={<ProductActions disabled={true} product={product} />}>
                                <ProductActions product={product} />
                            </Suspense>
                        </div>
                        <div className="mt-4">
                            <p className="line-clamp-3 text-medium text-default-500">{product.description}</p>
                        </div>
                        <div className="mt-6 flex flex-col gap-1">
                            <div className="mb-4 flex items-center gap-2 text-default-700">
                                <svg aria-hidden="true" height="24" role="img" viewBox="0 0 32 32" width="24">
                                    <path d="M4 16h12v2H4zm-2-5h10v2H2z" fill="currentColor" />
                                    <path
                                        d="m29.919 16.606l-3-7A1 1 0 0 0 26 9h-3V7a1 1 0 0 0-1-1H6v2h15v12.556A4 4 0 0 0 19.142 23h-6.284a4 4 0 1 0 0 2h6.284a3.98 3.98 0 0 0 7.716 0H29a1 1 0 0 0 1-1v-7a1 1 0 0 0-.081-.394M9 26a2 2 0 1 1 2-2a2 2 0 0 1-2 2m14-15h2.34l2.144 5H23Zm0 15a2 2 0 1 1 2-2a2 2 0 0 1-2 2m5-3h-1.142A3.995 3.995 0 0 0 23 20v-2h5Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <p className="text-small font-medium">Free shipping and 30 days return</p>
                            </div>
                            <LocalizedClientLink
                                className="inline-flex items-center text-small hover:opacity-80 transition-opacity my-2 text-default-400"
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
            <div className="max-w-7xl mx-auto px-6 my-16 sm:my-32" data-testid="related-products-container">
                <Suspense fallback={<SkeletonRelatedProducts />}>
                    <RelatedProducts product={product} />
                </Suspense>
            </div>
        </React.Fragment>
    );
};

export default ProductTemplate;
