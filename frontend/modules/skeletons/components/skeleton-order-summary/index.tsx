import SkeletonCartTotals from "@modules/skeletons/components/skeleton-cart-totals";

import { Skeleton } from "@/components/skeleton";

const SkeletonOrderSummary = () => {
    return (
        <div className="grid-cols-1">
            <SkeletonCartTotals header={false} />
            <Skeleton className="w-full min-h-[50px] py-[10px] mt-4" />
        </div>
    );
};

export default SkeletonOrderSummary;
