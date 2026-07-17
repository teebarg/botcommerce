import { createFileRoute, isNotFound, notFound } from "@tanstack/react-router";
import { seo } from "@/utils/seo";
import { productQuery } from "@/queries/user.queries";
import NotFound from "@/components/generic/not-found";
import ProductPageLoader from "@/components/store/products/product-page-loader";

export const Route = createFileRoute("/_mainLayout/products/$slug")({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        try {
            const product = await queryClient.fetchQuery(productQuery(slug));
            return {
                product,
            };
        } catch (err) {
            if (isNotFound(err)) {
                throw err
            }
            throw notFound();
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
            links: [
                {
                    rel: 'canonical',
                    href: `${baseUrl}/products/${product.slug}`,
                },
            ],
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
    notFoundComponent: () => {
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
    },
    pendingComponent: () => <ProductPageLoader />,
});
