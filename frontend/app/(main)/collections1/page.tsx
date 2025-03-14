import { Metadata } from "next";
import { CollectionTemplate } from "@modules/collections/templates";
import { SortOptions } from "types/global";
import { Suspense } from "react";

import { CollectionTemplateSkeleton } from "@/modules/collections/skeleton";
import { siteConfig } from "@/lib/config";
import { api } from "@/apis";
import { auth } from "@/actions/auth";
import ServerError from "@/components/server-error";
import { Category, WishItem } from "@/lib/models";
import ProductsClient from "./scroll-client";
import InfiniteScrollClient from "./scroll-client2";
import { Exclamation } from "nui-react-icons";
import { BtnLink } from "@/components/ui/btnLink";

type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

type Props = {
    searchParams: SearchParams;
};

export async function generateMetadata(): Promise<Metadata> {
    const metadata = {
        title: `Collections | ${siteConfig.name} Store`,
        description: siteConfig.description,
    } as Metadata;

    return metadata;
}

export default async function Collections({ searchParams }: Props) {
    const { minPrice, maxPrice, cat_ids, page, sortBy } = (await searchParams) || {};
    const user = await auth();
    const [brandRes, collectionsRes, catRes] = await Promise.all([api.brand.all(), api.collection.all(), api.category.all()]);

    // Early returns for error handling
    if (!brandRes || !collectionsRes || !catRes) {
        return <ServerError />;
    }

    const { brands } = brandRes;
    const { collections } = collectionsRes;
    const { categories } = catRes.data ?? {};

    let wishlist: WishItem[] = [];

    if (user) {
        const res = await api.user.wishlist();

        wishlist = res ? res.wishlists : [];
    }

    const queryParams: any = {
        query: "",
        limit: 12,
        page: page ?? 1,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        // collections: collection?.slug,
        categories: cat_ids,
    };

    const res = await api.product.search(queryParams);
    console.log("🚀 ~ Collections ~ res:", res)

    if (res.error) {
        return <ServerError />;
    }

    if (!res.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-content1">
                <div className="max-w-md mx-auto text-center">
                    <Exclamation className="w-20 h-20 mx-auto text-danger" />
                    <h1 className="text-4xl font-bold mt-6">Oops! No Products Found</h1>
                    <p className="text-default-500 my-4">{`There are no products in this category`}</p>
                    <BtnLink color="primary" href="/">
                        Go to Home
                    </BtnLink>
                </div>
            </div>
        );
    }
    const { products, facets, ...pagination } = res.data;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Products</h1>
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient
                    initialProducts={products}
                    initialSearchParams={queryParams}
                    dataHasNext={pagination.page < pagination.total_pages}
                    wishlist={wishlist}
                    user={user}
                    categories={categories}
                    brands={brands}
                    collections={collections}
                    facets={facets}
                    maxPrice="100000000"
                    minPrice="0"
                    initialPage={Number(pagination.page)}
                    // initialSortBy={sortBy}
                    // initialCatIds={cat_ids}
                />
            </Suspense>
        </div>
    );
    // return (
    //     <Suspense fallback={<CollectionTemplateSkeleton />}>
    //         <CollectionTemplate searchParams={searchParams} />
    //     </Suspense>
    // );
}
