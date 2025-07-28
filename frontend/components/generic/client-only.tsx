"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
    children: React.ReactNode;
    className?: string;
};

const ClientOnly: React.FC<Props> = ({ children, className }) => {
    const [hasMounted, setHasMounted] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return (
        <motion.div className={cn("", className)} initial={{ opacity: 0 }} viewport={{ once: true }} whileInView={{ opacity: 1 }}>
            {children}
        </motion.div>
    );
};

export default ClientOnly;
