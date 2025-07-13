"use client";

import { useLazyLoadComponent } from "@/lib/hooks/useLazyLoadComponent";
import { motion } from "framer-motion";

interface LazyFadeInProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export const LazyFadeIn = ({ children, delay = 0, className }: LazyFadeInProps) => {
    const { ref, hasEnteredView } = useLazyLoadComponent({ delay });

    return (
        <div ref={ref} className={className}>
            {hasEnteredView && (
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
                    {children}
                </motion.div>
            )}
        </div>
    );
};
