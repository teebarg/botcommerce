import { ChevronRight } from "nui-react-icons";
import React from "react";

import SkeletonProductPreview from "../skeletons/components/skeleton-product-preview";

import { Skeleton } from "@/components/skeleton";

const CollectionTemplateSkeleton = () => {
    return (
        <React.Fragment>
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
        </React.Fragment>
    );
};

export { CollectionTemplateSkeleton };
