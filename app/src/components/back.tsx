import React from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useLocation, useNavigate } from "@tanstack/react-router";

interface Props {
    className?: string;
    onClick?: () => void;
}

const BackButton: React.FC<Props> = ({ onClick, className }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const handleGoBack = () => {
        if (onClick) {
            onClick();

            return;
        }

        if (window.history.length > 1) {
            navigate({delta: -1})
        } else {
            navigate({to: "/"});
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
