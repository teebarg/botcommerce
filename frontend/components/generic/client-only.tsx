"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

type Props = {
    children: React.ReactNode;
};

const ClientOnly: React.FC<Props> = ({ children }) => {
    const [hasMounted, setHasMounted] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return (
        <motion.div initial={{ opacity: 0 }} viewport={{ once: true }} whileInView={{ opacity: 1 }}>
            {children}
        </motion.div>
    );
};

export default ClientOnly;
