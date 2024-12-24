import { ChevronRight } from "nui-react-icons";
import React from "react";

const CollectionTemplateSkeleton = () => {
    return (
        <React.Fragment>
            <div className="w-full">
                {/* Breadcrumb skeleton */}
                <nav className="hidden md:block">
                    <ol className="flex flex-wrap list-none rounded-small">
                        <li className="flex items-center">
                            <span>Home</span>
                            <span className="px-1 text-foreground/50">
                                <ChevronRight />
                            </span>
                        </li>
                        <li className="flex items-center">
                            <div className="h-4 w-24 bg-content1 animate-pulse rounded" />
                        </li>
                    </ol>
                </nav>

                <div className="flex gap-6 mt-0 md:mt-6">
                    <div className="w-full flex-1 flex-col">
                        {/* TopBar skeleton */}
                        <div className="sticky md:relative top-14 md:top-0 z-30 md:z-10 bg-content1 rounded-lg">
                            <div className="flex justify-between items-center p-4">
                                <div className="h-8 w-32 bg-content2 animate-pulse rounded" />
                                <div className="h-8 w-32 bg-content2 animate-pulse rounded" />
                            </div>
                        </div>

                        <main className="mt-4 w-full overflow-visible px-1">
                            <div className="block md:rounded-medium md:border-medium border-dashed border-divider md:px-2 py-4 min-h-[60vh]">
                                <div className="grid w-full gap-2 md:gap-4 grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                                    {/* Generate 8 skeleton product cards */}
                                    {[...Array(8)].map((_, index) => (
                                        <div key={index} className="flex flex-col animate-pulse">
                                            {/* Image skeleton */}
                                            <div className="aspect-square w-full bg-content1 rounded-medium" />
                                            {/* Title skeleton */}
                                            <div className="h-4 w-3/4 bg-content1 rounded mt-2" />
                                            {/* Price skeleton */}
                                            <div className="h-4 w-1/4 bg-content1 rounded mt-2" />
                                        </div>
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