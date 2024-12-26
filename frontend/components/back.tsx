"use client";

import { cn } from "@lib/util/cn";
import { useRouter } from "next/navigation";
import { ArrowLongLeft } from "nui-react-icons";
import React from "react";

interface Props {
    className?: string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    size?: "sm" | "md" | "lg";
    onClick?: () => void;
}

const BackButton: React.FC<Props> = ({ size = "sm", color = "default", onClick, className }) => {
    const router = useRouter();
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
        <button className={cn(className)} onClick={handleGoBack}>
            <ArrowLongLeft className="h-8 w-8" viewBox="0 0 15 15" />
        </button>
    );
};

export { BackButton };
