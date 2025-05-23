"use client";

import React from "react";
import { Home, PackageSearch, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCollections } from "@/lib/hooks/useApi";
import { Collection } from "@/types/models";
import { BtnLink } from "@/components/ui/btnLink";

const NoProductsFound = ({ searchQuery = "", onClearSearch = () => {}, onGoHome = () => {} }) => {
    const { data: collections } = useCollections();

    return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center px-4 py-8">
            {/* Icon Animation Container */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 animate-ping" />
                <div className="relative">
                    <PackageSearch className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
                </div>
            </div>

            {/* Main Content */}
            <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-default-900">No Products Found</h2>

                {searchQuery && (
                    <p className="text-default-500 mb-2">
                        {`We couldn't find any products matching`}
                        <span className="font-medium text-default-900 mx-1">{`"${searchQuery}"`}</span>
                    </p>
                )}

                <p className="text-default-500 mb-8 text-sm">Try adjusting your search or browse our suggested categories below.</p>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <Button aria-label="clear search" color="primary" startContent={<RefreshCcw className="w-4 h-4" />} onClick={onClearSearch}>
                        Clear Search
                    </Button>

                    <Button aria-label="home" startContent={<Home className="w-4 h-4" />} variant="outline" onClick={onGoHome}>
                        Go Home
                    </Button>
                </div>

                {/* Suggested Categories */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-default-900">Popular Categories</h3>

                    <div className="flex flex-wrap justify-center gap-2">
                        {collections?.slice(0, 4).map((collection: Collection, idx: number) => (
                            <BtnLink key={idx} aria-label={collection.name} href={`/collections/${collection.name}`}>
                                {collection.name}
                            </BtnLink>
                        ))}
                    </div>
                </div>

                {/* Search Tips */}
                <div className="mt-8 pt-6 border-t border-default-100">
                    <h3 className="text-sm font-semibold text-default-900 mb-3">Search Tips</h3>
                    <ul className="text-sm text-default-500 space-y-2">
                        <li>• Check for spelling mistakes</li>
                        <li>• Try using more general keywords</li>
                        <li>• Browse by category instead</li>
                        <li>• Consider similar terms</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NoProductsFound;
