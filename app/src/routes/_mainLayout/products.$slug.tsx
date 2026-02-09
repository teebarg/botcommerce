import { createFileRoute } from "@tanstack/react-router";
import RelatedProducts from "@/components/store/products/related-products";
import ReviewsSection from "@/components/products/product-reviews";
import { getProductFn } from "@/server/product.server";
import ProductView from "@/components/store/products/product-view";
import { seo } from "@/utils/seo";
import { ArrowUpRight, RefreshCcw, TriangleAlert } from "lucide-react";
import { BtnLink } from "@/components/ui/btnLink";
import { Button } from "@/components/ui/button";
import { LazyInView } from "@/components/LazyInView";

export const Route = createFileRoute("/_mainLayout/products/$slug")({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        const product = await getProductFn({ data: slug });
        return {
            product,
        };
    },
    head: ({ loaderData }) => {
        const product = loaderData?.product;
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const title = product?.name || "";

        return {
            meta: [
                ...seo({
                    title,
                    description: product?.description || "",
                    url: `${baseUrl}/products/${product?.slug}`,
                    image: product?.images?.[0]?.image,
                    name: title,
                }),
            ],
        };
    },
    notFoundComponent: () => {
        return (
            <div className="flex-1">
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
    const { product } = Route.useLoaderData();

    return (
        <main className="flex flex-col">
            <ProductView product={product} />

            <LazyInView>
                <RelatedProducts productId={product.id} />
            </LazyInView>
            <LazyInView>
                <ReviewsSection productName={product?.name} product_id={product?.id} />
            </LazyInView>
        </main>
    );
}
