"use client";

import { cn } from "@lib/util/cn";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "nui-react-icons";
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
        <React.Fragment>
            <button className={cn(className)} onClick={handleGoBack}>
                <ChevronLeft />
            </button>
        </React.Fragment>
    );
};

export { BackButton };
