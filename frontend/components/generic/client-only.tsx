"use client";

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

    return <>{children}</>;
};

export default ClientOnly;
