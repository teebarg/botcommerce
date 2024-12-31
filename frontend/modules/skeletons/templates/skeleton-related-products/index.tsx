import repeat from "@lib/util/repeat";
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview";

import { Skeleton } from "@/components/skeleton";

const SkeletonRelatedProducts = () => {
    return (
        <div>
            <div className="flex flex-col gap-4 items-center text-center mb-8">
                <Skeleton className="w-20 h-6" />
                <Skeleton className="w-72 md:w-96 h-10" />
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-8 flex-1">
                {repeat(4).map((index) => (
                    <li key={index}>
                        <SkeletonProductPreview />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SkeletonRelatedProducts;
