import { Skeleton } from "@/components/skeleton";

const SkeletonCartTotals = ({ header = true }) => {
    return (
        <div className="flex flex-col">
            {header && <Skeleton className="w-32 h-4 mb-4" />}
            <div className="flex items-center justify-between">
                <Skeleton className="w-32 h-3" />
                <Skeleton className="w-32 h-3" />
            </div>

            <div className="flex items-center justify-between my-4">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-24 h-3" />
            </div>

            <div className="flex items-center justify-between">
                <Skeleton className="w-28 h-3" />
                <Skeleton className="w-20 h-3" />
            </div>

            <div className="flex items-center justify-between mt-4">
                <Skeleton className="w-32 h-6 mb-4" />
                <Skeleton className="w-24 h-6 mb-4" />
            </div>
        </div>
    );
};

export default SkeletonCartTotals;
