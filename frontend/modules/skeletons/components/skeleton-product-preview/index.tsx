const SkeletonProductPreview = () => {
    return (
        <div className="animate-pulse max-h-20">
            <div className="shadow-md aspect-[9/16] w-full bg-default-500" />
            <div className="flex justify-between text-base mt-2">
                <div className="w-2/5 h-6 bg-gray-100" />
                <div className="w-1/5 h-6 bg-gray-100" />
            </div>
        </div>
    );
};

export default SkeletonProductPreview;
