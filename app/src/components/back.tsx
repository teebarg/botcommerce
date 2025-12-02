"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
            router.push("/");
        }
    };

    return (
        <Button
            aria-label="back button"
            className={cn(className, "text-foreground h-auto w-auto md:hidden", pathname == "/" && "hidden")}
            size="icon"
            variant="ghost"
            onClick={handleGoBack}
        >
            <ArrowLeft className="h-8 w-8" />
        </Button>
    );
};

export { BackButton };
