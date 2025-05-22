import React from "react";

// Base skeleton component with shimmer animation
export const Skeleton = ({ className = "", ...props }) => (
    <div className={`bg-gradient-to-r from-content2 via-content1 to-content2 bg-200 animate-shimmer rounded ${className}`} {...props} />
);

// Text skeleton lines
export const TextSkeleton = ({ lines = 3, className = "" }) => (
    <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`} />
        ))}
    </div>
);

// Avatar skeleton
export const AvatarSkeleton = ({ size = "md" }) => {
    const sizeClasses: Record<string, string> = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
    };

    return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
};

// Card skeleton
export const CardSkeleton = ({ showAvatar = true, textLines = 3 }) => (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        {showAvatar && (
            <div className="flex items-center space-x-4 mb-4">
                <AvatarSkeleton />
                <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        )}
        <TextSkeleton lines={textLines} />
    </div>
);

// List item skeleton
export const ListItemSkeleton = () => (
    <div className="flex items-center space-x-4 p-4">
        <AvatarSkeleton size="sm" />
        <div className="flex-1">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-8 w-16" />
    </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className="w-full">
        {/* Table header */}
        <div className="flex space-x-4 p-4 border-b border-gray-200">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4 p-4 border-b border-gray-100">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-4 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

// Image skeleton
export const ImageSkeleton = ({ aspectRatio = "video", className = "" }) => {
    const aspectClasses: Record<string, string> = {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[3/4]",
        wide: "aspect-[21/9]",
    };

    return <Skeleton className={`w-full ${aspectClasses[aspectRatio]} ${className}`} />;
};

// Loading spinner
export const LoadingSpinner = ({ size = "md", className = "" }) => {
    const sizeClasses: Record<string, string> = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );
};

// Pulse loading dots
export const PulseLoader = ({ className = "" }) => (
    <div className={`flex space-x-2 ${className}`}>
        {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
    </div>
);

// Main demo component
export default function LoadingSkeletons() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Beautiful Loading Skeletons</h1>
                    <p className="text-gray-600 text-lg">Responsive skeleton components for any use case</p>
                </div>

                {/* Spinners and Dots */}
                <section className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6">Spinners & Animated Loaders</h2>
                    <div className="flex items-center justify-center space-x-8">
                        <div className="text-center">
                            <LoadingSpinner size="sm" />
                            <p className="text-sm text-gray-500 mt-2">Small</p>
                        </div>
                        <div className="text-center">
                            <LoadingSpinner size="md" />
                            <p className="text-sm text-gray-500 mt-2">Medium</p>
                        </div>
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="text-sm text-gray-500 mt-2">Large</p>
                        </div>
                        <div className="text-center">
                            <PulseLoader />
                            <p className="text-sm text-gray-500 mt-2">Pulse Dots</p>
                        </div>
                    </div>
                </section>

                {/* Text Skeletons */}
                <section className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6">Text Skeletons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Short Text (2 lines)</h3>
                            <TextSkeleton lines={2} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-4">Long Text (5 lines)</h3>
                            <TextSkeleton lines={5} />
                        </div>
                    </div>
                </section>

                {/* Avatar Skeletons */}
                <section className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6">Avatar Skeletons</h2>
                    <div className="flex items-center justify-center space-x-8">
                        <div className="text-center">
                            <AvatarSkeleton size="sm" />
                            <p className="text-sm text-gray-500 mt-2">Small</p>
                        </div>
                        <div className="text-center">
                            <AvatarSkeleton size="md" />
                            <p className="text-sm text-gray-500 mt-2">Medium</p>
                        </div>
                        <div className="text-center">
                            <AvatarSkeleton size="lg" />
                            <p className="text-sm text-gray-500 mt-2">Large</p>
                        </div>
                        <div className="text-center">
                            <AvatarSkeleton size="xl" />
                            <p className="text-sm text-gray-500 mt-2">Extra Large</p>
                        </div>
                    </div>
                </section>

                {/* Image Skeletons */}
                <section className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6">Image Skeletons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="text-sm font-medium mb-3">Square</h3>
                            <ImageSkeleton aspectRatio="square" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-3">Video (16:9)</h3>
                            <ImageSkeleton aspectRatio="video" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-3">Portrait (3:4)</h3>
                            <ImageSkeleton aspectRatio="portrait" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-3">Wide (21:9)</h3>
                            <ImageSkeleton aspectRatio="wide" />
                        </div>
                    </div>
                </section>

                {/* Card Skeletons */}
                <section className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6">Card Skeletons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CardSkeleton showAvatar={true} textLines={3} />
                        <CardSkeleton showAvatar={false} textLines={4} />
                    </div>
                </section>

                {/* List Skeletons */}
                <section className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-semibent mb-6">List Item Skeletons</h2>
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ListItemSkeleton key={i} />
                        ))}
                    </div>
                </section>

                {/* Table Skeleton */}
                <section className="bg-white rounded-xl p-8 shadow-sm overflow-hidden">
                    <h2 className="text-2xl font-semibold mb-6">Table Skeleton</h2>
                    <TableSkeleton columns={4} rows={5} />
                </section>
            </div>
        </div>
    );
}
