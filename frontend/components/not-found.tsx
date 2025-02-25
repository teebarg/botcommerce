import { ExclamationIcon } from "nui-react-icons";
import React from "react";

import { cn } from "@/lib/util/cn";
import { BackButton } from "@/components/back";

interface Props {
    className?: string;
}

const NF: React.FC<Props> = async ({ className }) => {
    return (
        <div className={cn("flex items-center justify-center h-full bg-content1 py-12 px-4", className)}>
            <div className="max-w-md mx-auto text-center">
                <ExclamationIcon className="w-20 h-20 mx-auto text-danger" />
                <h1 className="text-4xl font-bold mt-6">Oops! Page Not Found</h1>
                <p className="text-default-500 my-4">{`The page you're looking for doesn't exist or has been moved.`}</p>
                <BackButton />
            </div>
        </div>
    );
};

export default NF;
