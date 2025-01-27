"use client";

import { cn } from "@lib/util/cn";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLongLeft } from "nui-react-icons";
import React from "react";

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
        <button aria-label="back button" className={cn(className, pathname == "/" && "hidden")} onClick={handleGoBack}>
            <ArrowLongLeft className="h-6 w-6" viewBox="0 0 15 15" />
        </button>
    );
};

export { BackButton };
