"use client";

import React, { createContext, useContext, useEffect } from "react";

import { useShopSettingsPublic } from "@/hooks/useGeneric";
import { setCookie } from "@/lib/util/cookie";

type StoreContextType = {
    settings?: Record<string, string | number> | null;
    loading: boolean;
    error: any;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: settings, isLoading, error } = useShopSettingsPublic();

    useEffect(() => {
        if (settings) {
            setCookie("configs", JSON.stringify(settings));
        }
    }, [settings]);

    return <StoreContext.Provider value={{ settings, loading: isLoading, error }}>{children}</StoreContext.Provider>;
};

export const useStoreSettings = () => {
    const ctx = useContext(StoreContext);

    if (!ctx) throw new Error("useStoreSettings must be used within a StoreProvider");

    return ctx;
};
