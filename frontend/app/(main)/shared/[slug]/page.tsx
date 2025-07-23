import { notFound } from "next/navigation";
import { api } from "@/apis/client2";
import { Shared } from "@/schemas";
import { tryCatchApi } from "@/lib/try-catch";
import { Metadata } from "next";
import { SocialShare } from "@/components/store/shared/shared-listing";
import ProductCardBase from "@/components/store/products/product-shared-card";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: shared } = await tryCatchApi<Shared>(api.get(`/shared/${slug}`));

    if (!shared) {
        return {
            title: "Shared Collection Not Found",
            description: "This shared collection does not exist or is no longer available.",
            openGraph: {
                title: "Shared Collection Not Found",
                description: "This shared collection does not exist or is no longer available.",
            },
        } as Metadata;
    }

    return {
        title: shared.title,
        description: shared.description || `Curated product list: ${shared.title}`,
        openGraph: {
            title: shared.title,
            description: shared.description || `Curated product list: ${shared.title}`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/shared/${shared.slug}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: shared.title,
            description: shared.description || `Curated product list: ${shared.title}`,
        },
    } as Metadata;
}

export default async function SharedPage({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: shared } = await tryCatchApi<Shared>(api.get(`/shared/${slug}`));
    if (!shared || !shared.is_active) return notFound();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-2">{shared.title}</h1>
            {shared.description && <p className="mb-4 text-lg text-default-600">{shared.description}</p>}
            <SocialShare title={shared.title} />
            <div className="mb-6 text-sm text-default-400">Curated list • {shared.view_count} views</div>
            {shared.products && shared.products.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {shared.products.map((product, index) => (
                        <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="break-inside-avoid">
                            <ProductCardBase product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div>No products in this collection.</div>
            )}
        </div>
    );
}
