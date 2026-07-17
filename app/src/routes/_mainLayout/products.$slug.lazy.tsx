import { createLazyFileRoute } from "@tanstack/react-router";
import ProductView from "@/components/store/products/product-view";
import { LazyInView } from "@/components/LazyInView";
import { productQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import RelatedProducts from "@/components/store/products/related-products";
import ReviewsSection from "@/components/products/product-reviews";

export const Route = createLazyFileRoute("/_mainLayout/products/$slug")({
    component: RouteComponent,
});

function RouteComponent() {
    const { slug } = Route.useParams();
    const { data: product } = useSuspenseQuery(productQuery(slug));

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
