import { Metadata } from "next";
import { ExclamationIcon } from "nui-react-icons";
import React from "react";

import { BtnLink } from "@/components/ui/btnLink";

export const metadata: Metadata = {
    title: "404",
    description: "Something went wrong",
};

interface Props {}

const NotFound: React.FC<Props> = async () => {
    return (
        <div className="flex flex-col items-center justify-center bg-content1 h-screen">
            <div className="max-w-md mx-auto text-center">
                <ExclamationIcon className="w-20 h-20 mx-auto text-danger" />
                <h1 className="text-4xl font-bold mt-6">Oops! Page Not Found</h1>
                <p className="text-default-500 my-4">{`The page you're looking for doesn't exist or has been moved.`}</p>
                <BtnLink color="primary" href="/collections">
                    Continue shopping
                </BtnLink>
            </div>
        </div>
    );
};

export default NotFound;
