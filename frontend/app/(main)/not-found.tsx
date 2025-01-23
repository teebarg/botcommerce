import { Metadata } from "next";
import React from "react";
import NF from "@/components/not-found";

export const metadata: Metadata = {
    title: "404",
    description: "Something went wrong",
};

const NotFound: React.FC = async () => {
    return <NF />;
};

export default NotFound;
