import { notFound } from "next/navigation";
import { Metadata } from "next";

import { Catalog, Shared } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import SharedInfinite from "@/components/store/shared/shared-infinite";
import { SharedCollectionVisitTracker } from "@/components/store/shared/shared-collection-visit-tracker";
import { serverApi } from "@/apis/server-client";
import { SortOptions } from "@/types/models";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

type SearchParams = Promise<{
    sortBy?: SortOptions;
    sizes?: string;
    colors?: string;
}>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: shared } = await tryCatch<Shared>(serverApi.get(`/shared/${slug}`));

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

export default async function SharedPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { slug } = await params;
    const { sortBy, sizes, colors } = (await searchParams) || {};

    const queryParams: any = {
        limit: 12,
        sort: sortBy ?? "created_at:desc",
        sizes: sizes,
        colors: colors,
    };

    const { data: catalog, error } = await tryCatch<Catalog>(serverApi.get(`/shared/${slug}`, { params: { skip: 0, ...queryParams } }));

    if (!catalog || error) return notFound();

    return (
        <div className="bg-content2">
            <div className="max-w-9xl mx-auto w-full p-4">
                <SharedCollectionVisitTracker slug={slug} />
                <div className="px-8">
                    <h1 className="text-3xl font-bold mb-2">{catalog.title}</h1>
                    {catalog.description && <p className="mb-4 text-lg text-default-600">{catalog.description}</p>}
                </div>
                <SharedInfinite initialCatalog={catalog} initialSearchParams={queryParams} slug={slug} />
            </div>
        </div>
    );
}
