import type React from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
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
        <motion.button
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn("p-2.5 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border", className)}
            onClick={handleGoBack}
        >
            <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
    );
};

export { BackButton };
