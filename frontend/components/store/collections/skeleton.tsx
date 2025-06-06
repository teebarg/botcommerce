import { ChevronRight } from "nui-react-icons";
import React from "react";

import { Skeleton } from "@/components/generic/skeleton";
import { Separator } from "@/components/ui/separator";

const CollectionTemplateSkeleton = () => {
    return (
        <React.Fragment>
            <div className="hidden md:block">
                <div className="h-full w-[20rem] overflow-x-hidden overflow-y-scroll max-h-[90vh] sticky top-16">
                    <div className="h-full w-full max-w-sm rounded-xl p-6 bg-default-100 text-sm space-y-4">
                        <div className="space-y-2">
                            <span>Collections</span>
                            <div className="space-y-2">
                                {[1, 2, 3]?.map((_, index: number) => <Skeleton key={index} className="h-8 w-full rounded dark:bg-background" />)}
                            </div>
                        </div>
                        <Separator />
                        {["Categories", "Brands"].map((item: string, index: number) => (
                            <div key={index} className="flex flex-col gap-2">
                                <span>{item}</span>
                                {[1, 2, 3, 4, 5]?.map((_, index: number) => (
                                    <Skeleton key={index} className="h-10 w-full rounded dark:bg-background" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full flex-1 flex-col">
                <div className="w-full">
                    {/* Breadcrumb skeleton */}
                    <nav className="hidden md:block">
                        <ol className="flex flex-wrap list-none rounded-lg">
                            <li className="flex items-center">
                                <span>Home</span>
                                <span className="px-1">
                                    <ChevronRight />
                                </span>
                            </li>
                            <li>
                                <Skeleton className="h-4 w-24 rounded" />
                            </li>
                        </ol>
                    </nav>

                    <div>
                        <div className="w-full flex-1 flex-col">
                            {/* TopBar skeleton */}
                            <Skeleton className="h-14 w-full rounded" />

                            <main className="mt-4 w-full px-1">
                                <div className="block md:rounded-xl md:border-2 border-dashed border-divider md:px-2 py-4">
                                    <div className="grid w-full gap-2 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-4">
                                        {/* Generate 8 skeleton product cards */}
                                        {[...Array(8)].map((_, index) => (
                                            <div key={index} className="flex flex-col">
                                                {/* Image skeleton */}
                                                <Skeleton className="aspect-square w-full rounded-xl" />
                                                {/* Title skeleton */}
                                                <Skeleton className="h-4 w-3/4 rounded mt-2" />
                                                {/* Price skeleton */}
                                                <Skeleton className="h-4 w-1/4 rounded mt-2" />
                                            </div>
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
