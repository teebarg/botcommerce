import React from "react";

export const Skeleton = ({ className = "", ...props }) => (
    <div className={`bg-linear-to-r from-background/20 to-secondary/20 animate-shimmer rounded ${className}`} {...props} />
);
export const TextSkeleton = ({ lines = 3, className = "" }) => (
    <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`} />
        ))}
    </div>
);

export const AvatarSkeleton = ({ size = "md" }) => {
    const sizeClasses: Record<string, string> = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
    };

    return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
};

export const CardSkeleton = ({ showAvatar = true, textLines = 3 }) => (
    <div className="p-6 bg-background rounded-lg shadow-sm border border-divider">
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

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className="w-full">
        <div className="flex space-x-4 p-4 border-b border-divider">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4 p-4 border-b border-divider">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-4 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

export const ImageSkeleton = ({ aspectRatio = "video", className = "" }) => {
    const aspectClasses: Record<string, string> = {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-3/4",
        wide: "aspect-21/9",
    };

    return <Skeleton className={`w-full ${aspectClasses[aspectRatio]} ${className}`} />;
};

export const LoadingSpinner = ({ size = "md", className = "" }) => {
    const sizeClasses: Record<string, string> = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full border-divider border-t-blue-500 rounded-full animate-spin" />
        </div>
    );
};

export const PulseLoader = ({ className = "" }) => (
    <div className={`flex space-x-2 ${className}`}>
        {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
    </div>
);
