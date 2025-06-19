import React from "react";
import { ChevronRight } from "nui-react-icons";

import { Skeleton } from "@/components/ui/skeletons";

const SkeletonProductTemplate = () => {
    return (
        <React.Fragment>
            <div className="max-w-7xl mx-auto h-full w-full px-2 lg:px-12 my-8">
                {/* Breadcrumb skeleton */}
                <nav className="hidden md:block">
                    <ol className="flex flex-wrap list-none rounded-lg">
                        <li className="flex items-center">
                            <Skeleton className="w-12 h-4" />
                        </li>
                        <li className="flex items-center">
                            <span className="px-1">
                                <ChevronRight />
                            </span>
                            <Skeleton className="w-20 h-4" />
                        </li>
                        <li className="flex items-center">
                            <span className="px-1">
                                <ChevronRight />
                            </span>
                            <Skeleton className="w-32 h-4" />
                        </li>
                    </ol>
                </nav>

                <div className="relative grid grid-cols-1 md:grid-cols-2 md:gap-x-8 mt-4">
                    {/* Image gallery skeleton */}
                    <div className="relative h-full w-full flex-none hidden md:flex gap-4">
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4].map((index) => (
                                <Skeleton key={index} className="w-[80px] h-[120px] rounded-lg" />
                            ))}
                        </div>
                        <div className="flex-1">
                            <Skeleton className="h-[60vh] w-full rounded-lg" />
                        </div>
                    </div>

                    {/* Product details skeleton */}
                    <div className="flex flex-col px-2 md:px-0">
                        <Skeleton className="w-3/4 h-8 mb-2" /> {/* Title */}
                        <div className="my-2">
                            <Skeleton className="w-32 h-4" /> {/* Reviews */}
                        </div>
                        <div className="max-w-40 mt-2">
                            <Skeleton className="w-full h-10 rounded-lg" /> {/* Add to cart button */}
                        </div>
                        <div className="mt-4">
                            <Skeleton className="w-full h-20" /> {/* Description */}
                        </div>
                        <div className="mt-6">
                            <Skeleton className="w-64 h-6 mb-4" /> {/* Shipping info */}
                            <Skeleton className="w-24 h-4" /> {/* Guide link */}
                        </div>
                        {/* Product details skeleton */}
                        <div className="mt-8">
                            <Skeleton className="w-full h-40" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom fixed bar skeleton */}
            <div className="fixed bottom-0 z-50 w-full px-6 py-3 flex gap-2 bg-background shadow-lg">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="flex-1 h-10 rounded-lg" />
            </div>
        </React.Fragment>
    );
};

export default SkeletonProductTemplate;
