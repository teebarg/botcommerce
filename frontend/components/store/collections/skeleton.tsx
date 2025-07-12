import React from "react";
import ComponentLoader from "@/components/component-loader";

const CollectionTemplateSkeleton = () => {
    return (
        <React.Fragment>
            <div className="hidden md:block">
                <ComponentLoader className="h-full w-[20rem] max-h-[90vh]" />
            </div>
            <div className="w-full flex-1 flex-col">
                <ComponentLoader className="w-full" />
            </div>
        </React.Fragment>
    );
};

export { CollectionTemplateSkeleton };
