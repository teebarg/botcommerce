import { createFileRoute } from "@tanstack/react-router";
import ReviewsSection from "@/components/products/product-reviews";
import ProductView from "@/components/store/products/product-view";
import { seo } from "@/utils/seo";
import { LazyInView } from "@/components/LazyInView";
import { productQuery } from "@/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/components/generic/not-found";
import ProductPageLoader from "@/components/store/products/product-page-loader";
import RelatedProducts from "@/components/store/products/related-products";

export const Route = createFileRoute("/_mainLayout/products/$slug")({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        try {
            const product = await queryClient.ensureQueryData(productQuery(slug));
            return {
                product,
            };
        } catch (err) {
            throw new Error("PRODUCT_NOT_FOUND");
        }
    },
    head: ({ loaderData }) => {
        const product = loaderData?.product;
        if (!product) {
            return {
                title: "Product Not Found | Revoque",
                meta: [
                    { name: "robots", content: "noindex, nofollow" }
                ]
            };
        }

        const baseUrl = import.meta.env.VITE_BASE_URL;
        const title = product.name || "";

        return {
            meta: [
                ...seo({
                    title,
                    description: product.description || "",
                    url: `${baseUrl}/products/${product.slug}`,
                    image: product.images?.[0]?.image,
                    name: title,
                }),
            ],
        };
    },
    errorComponent: ({ error }) => {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (
                <NotFound
                    eyebrow="Product unavailable"
                    title="Product not found"
                    description="This product may have been removed or the link is incorrect."
                    showSearch
                    primaryAction={{ label: "Browse collections", to: "/collections" }}
                    variant="auto"
                />
            );
        }
    },
    pendingComponent: () => <ProductPageLoader />,
    component: RouteComponent,
});

function RouteComponent() {
    const { slug } = Route.useParams();
    const { data: product } = useQuery(productQuery(slug));

    if (!product) {
        return <NotFound
            eyebrow="Product unavailable"
            title="Product not found"
            description="This product may have been removed or the link is incorrect."
            showSearch
            primaryAction={{ label: "Browse collections", to: "/collections" }}
            variant="auto"
        />;
    }

    return (
        <main className="flex flex-col">
            <ProductView product={product} />
            <LazyInView>
                <RelatedProducts productId={product.id} />
            </LazyInView>
            <LazyInView>
                <ReviewsSection productName={product.name} product_id={product.id} />
            </LazyInView>
        </main>
    );
}
