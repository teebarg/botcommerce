import type React from "react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/utils";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";

interface Props {
    className?: string;
    onClick?: () => void;
}

const BackButton: React.FC<Props> = ({ onClick, className }) => {
    const router = useRouter();
    const navigate = useNavigate();
    const canGoBack = useCanGoBack();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleGoBack = () => {
        if (onClick) {
            onClick();
            return;
        }

        if (canGoBack) {
            router.history.back();
        } else {
            navigate({ to: "/" });
        }
    };

    if (!mounted) {
        return null;
    }

    if (!canGoBack) {
        return null;
    }

    return (
        <button
            className={cn("p-2.5 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border animate-in fade-in slide-in-from-left-2 duration-300 delay-200", className)}
            onClick={handleGoBack}
        >
            <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
    );
};

export { BackButton };
