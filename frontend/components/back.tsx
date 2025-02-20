"use client";

import { cn } from "@lib/util/cn";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLongLeft } from "nui-react-icons";
import React from "react";

import { Button } from "./ui/button";

interface Props {
    className?: string;
    onClick?: () => void;
}

const BackButton: React.FC<Props> = ({ onClick, className }) => {
    const router = useRouter();
    const pathname = usePathname();
    const handleGoBack = () => {
        if (onClick) {
            onClick();

            return;
        }

        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/"); // Navigate to a fallback route
        }
    };

    return (
        <Button
            aria-label="back button"
            className={cn(className, "bg-transparent md:bg-indigo-700 px-0 md:px-8 min-w-2 md:text-white", pathname == "/" && "hidden")}
            size="md"
            onClick={handleGoBack}
        >
            <ArrowLongLeft className="h-6 w-6" viewBox="0 0 15 15" />
            <span className="hidden md:block">Go back</span>
        </Button>
    );
};

export { BackButton };
