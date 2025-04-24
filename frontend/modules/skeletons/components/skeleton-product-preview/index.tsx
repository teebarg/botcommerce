import { Skeleton } from "@/components/generic/skeleton";

const SkeletonProductPreview = () => {
    return (
        <div className="flex flex-col">
            {/* Image skeleton */}
            <Skeleton className="aspect-square w-full rounded-xl" />
            {/* Title skeleton */}
            <Skeleton className="h-4 w-3/4 rounded mt-2" />
            {/* Price skeleton */}
            <Skeleton className="h-4 w-1/4 rounded mt-2" />
        </div>
    );
};

export default SkeletonProductPreview;
