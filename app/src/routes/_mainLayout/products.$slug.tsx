import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import RelatedProducts from "@/components/store/products/related-products";
import ReviewsSection from "@/components/products/product-reviews";
import { getProductFn, getRelatedProductFn } from "@/server/product.server";
import SuspenseQuery from "@/utils/query";
import { getProductReviewFn } from "@/server/review.server";
import { PaginatedReview, ProductSearch } from "@/schemas";
import ProductView from "@/components/store/products/product-view";
import { ordersQueryOptions } from "@/hooks/useOrder";
import { seo } from "@/utils/seo";
import { ArrowUpRight, RefreshCcw, TriangleAlert } from "lucide-react";
import { BtnLink } from "@/components/ui/btnLink";
import { Button } from "@/components/ui/button";

const productQueryOptions = (slug: string) => ({
    queryKey: ["product", slug],
    queryFn: () => getProductFn({ data: slug }),
});

const reviewsQueryOptions = (productId: number) => ({
    queryKey: ["reviews", productId],
    queryFn: () => getProductReviewFn({ data: { product_id: productId, limit: 5 } }),
});

const relatedProductsQueryOptions = (productId: number, limit: number) => ({
    queryKey: ["products", "similar", productId, limit],
    queryFn: () => getRelatedProductFn({ data: { productId, limit } }),
});

export const Route = createFileRoute("/_mainLayout/products/$slug")({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        const data = await queryClient.ensureQueryData(productQueryOptions(slug));

        queryClient.prefetchQuery(reviewsQueryOptions(data.id));
        queryClient.prefetchQuery(relatedProductsQueryOptions(data.id, 4));
        queryClient.prefetchQuery(ordersQueryOptions({}));

        return {
            data,
        };
    },
    head: ({ loaderData }) => {
        const product = loaderData?.data;
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const name = product?.name;
        const title = name || "";

        return {
            title,
            meta: [
                ...seo({
                    title,
                    description: product?.description || "",
                    url: `${baseUrl}/products/${product?.slug}`,
                    image: product?.images?.[0]?.image,
                    name,
                }),
            ],
        };
    },
    notFoundComponent: () => {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="max-w-2xl mx-auto text-center px-4">
                    <TriangleAlert className="w-20 h-20 mx-auto text-destructive mb-8" />
                    <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        {`We couldn't find the product you're looking for. It might have been removed or is temporarily unavailable.`}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <BtnLink href="/collections" size="lg">
                            Browse Collections
                            <ArrowUpRight className="w-4 h-4" />
                        </BtnLink>
                        <Button
                            aria-label="reload button"
                            className="px-8 rounded-full min-w-48"
                            size="lg"
                            startContent={<RefreshCcw className="h-4 w-4" />}
                            onClick={() => window.location.reload()}
                        >
                            <span>Reload</span>
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { slug } = Route.useParams();
    const { data: product } = useSuspenseQuery(productQueryOptions(slug));

    return (
        <main className="flex flex-col gap-y-8">
            <ProductView product={product} />

            <section className="related-products">
                <Suspense fallback={<div>Loading related products...</div>}>
                    <SuspenseQuery queryOptions={relatedProductsQueryOptions(product.id, 4)}>
                        {(related: { similar: ProductSearch[] }) => (
                            <div className="max-w-7xl mx-1 md:mx-auto px-2 md:px-6 my-4 w-full">
                                <RelatedProducts similar={related.similar} productId={product.id} />
                            </div>
                        )}
                    </SuspenseQuery>
                </Suspense>
            </section>

            <section className="reviews">
                <Suspense fallback={<div>Loading reviews...</div>}>
                    <SuspenseQuery queryOptions={reviewsQueryOptions(product.id)}>
                        {(reviews: PaginatedReview) => (
                            <ReviewsSection productName={product?.name} product_id={product?.id} paginatedReviews={reviews} />
                        )}
                    </SuspenseQuery>
                </Suspense>
            </section>
        </main>
    );
}
