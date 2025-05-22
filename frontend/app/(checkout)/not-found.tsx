import { Metadata } from "next";
import React from "react";

import NotFoundUI from "@/components/generic/not-found";

export const metadata: Metadata = {
    title: "404",
    description: "Something went wrong",
};

const NotFound: React.FC = async () => {
    return <NotFoundUI className="h-screen" scenario="404" />;
};

export default NotFound;
