"use client";

import { OverlayProvider } from "@react-aria/overlays";
import React from "react";

interface Props {
    children: React.ReactNode;
}

const OverlayClientProvider: React.FC<Props> = ({ children }) => {
    return <OverlayProvider>{children}</OverlayProvider>;
};

export default OverlayClientProvider;
