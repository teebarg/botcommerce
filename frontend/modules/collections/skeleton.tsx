import { ChevronRight } from "nui-react-icons";
import React from "react";

import SkeletonProductPreview from "../skeletons/components/skeleton-product-preview";

import { Skeleton } from "@/components/skeleton";

const CollectionTemplateSkeleton = () => {
    return (
        <React.Fragment>
            <div className="hidden md:block">
                <div className="h-full min-w-[20rem] max-w-[20rem] overflow-x-hidden overflow-y-scroll max-h-[90vh] sticky top-16">
                    <div className="h-full w-full max-w-sm rounded-medium p-6 bg-default-100">
                        <div>
                            <span className="text-sm">Collections</span>
                            <hr className="shrink-0 border-none w-full h-[1px] my-1 bg-default-100" />
                            <div className="block mb-6 space-y-1">
                                {[1, 2, 3]?.map((_, index: number) => <Skeleton key={index} className="h-8 w-full rounded dark:bg-background" />)}
                            </div>
                        </div>
                        <h2 className="text-sm font-medium text-foreground mt-8">Filter by</h2>
                        <hr className="shrink-0 border-none w-full h-[1px] my-3 bg-default-100" />
                        <div className="flex flex-col">
                            <span>Categories</span>
                            {[1, 2, 3, 4, 5]?.map((_, index: number) => (
                                <Skeleton key={index} className="h-12 w-full rounded dark:bg-background mt-2" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex-1 flex-col">
                <div className="w-full">
                    {/* Breadcrumb skeleton */}
                    <nav className="hidden md:block">
                        <ol className="flex flex-wrap list-none rounded-small">
                            <li className="flex items-center">
                                <span>Home</span>
                                <span className="px-1">
                                    <ChevronRight />
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Skeleton className="h-4 w-24 rounded" />
                            </li>
                        </ol>
                    </nav>

                    <div className="flex gap-6 mt-0 md:mt-6">
                        <div className="w-full flex-1 flex-col">
                            {/* TopBar skeleton */}
                            <Skeleton className="h-14 w-full rounded" />

                            <main className="mt-4 w-full px-1">
                                <div className="block md:rounded-medium md:border-medium border-dashed border-divider md:px-2 py-4">
                                    <div className="grid w-full gap-2 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-4">
                                        {/* Generate 8 skeleton product cards */}
                                        {[...Array(8)].map((_, index) => (
                                            <SkeletonProductPreview key={index} />
                                        ))}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export { CollectionTemplateSkeleton };
