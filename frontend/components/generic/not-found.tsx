"use client";

import { Exclamation } from "nui-react-icons";
import React from "react";

import { Button } from "../ui/button";

import { cn } from "@/lib/util/cn";

interface Props {
    className?: string;
}

const NF: React.FC<Props> = ({ className }) => {
    return (
        <div className={cn("flex items-center justify-center h-full bg-content1 py-12 px-4", className)}>
            <div className="max-w-md mx-auto text-center">
                <Exclamation className="w-20 h-20 mx-auto text-danger" />
                <h1 className="text-4xl font-bold mt-6">Oops! Page Not Found</h1>
                <p className="text-default-500 my-4">{`The page you're looking for doesn't exist or has been moved.`}</p>
                <Button className="min-w-32" variant="default" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
        </div>
    );
};

export default NF;
