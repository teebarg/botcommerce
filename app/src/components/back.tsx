import type React from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/utils";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface Props {
    className?: string;
    onClick?: () => void;
}

const BackButton: React.FC<Props> = ({ onClick, className }) => {
    const router = useRouter();
    const canGoBack = useCanGoBack();
    const navigate = useNavigate();
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

    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(className, "p-2.5 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border", !canGoBack && "hidden")}
            onClick={handleGoBack}
        >
            <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
    );
};

export { BackButton };
