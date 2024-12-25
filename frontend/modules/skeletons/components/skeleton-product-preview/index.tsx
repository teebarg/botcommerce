const SkeletonProductPreview = () => {
    return (
        <>
            <div className="flex flex-col animate-pulse">
                {/* Image skeleton */}
                <div className="aspect-square w-full bg-gray-300 rounded-medium" />
                {/* Title skeleton */}
                <div className="h-4 w-3/4 bg-gray-300 rounded mt-2" />
                {/* Price skeleton */}
                <div className="h-4 w-1/4 bg-gray-300 rounded mt-2" />
            </div>
        </>
    );
};

export default SkeletonProductPreview;
