"use client";

import React from "react";

import { Skeleton } from "@/components/generic/skeleton";

const SkeletonOrderConfirmed: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-2">
            <div className="w-full max-w-2xl mx-auto">
                {/* Header Skeleton */}
                <div className="text-center mb-6">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto mb-2" />
                    <Skeleton className="h-5 w-64 mx-auto" />
                </div>

                {/* Order Info Skeleton */}
                <div className="space-y-4 mb-6">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>

                {/* Order Items Skeleton */}
                <div className="space-y-4 mb-6">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <Skeleton className="h-20 w-20 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary Skeleton */}
                <div className="space-y-4 mb-6">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons Skeleton */}
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonOrderConfirmed;
