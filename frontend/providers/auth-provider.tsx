"use client";

import React, { createContext, useContext } from "react";
import { User } from "@/schemas";
import { useMe } from "@/lib/hooks/useApi";

type AuthContextType = {
    user?: User | null;
    loading: boolean;
    error: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: user, isLoading, error } = useMe();

    return <AuthContext.Provider value={{ user, loading: isLoading, error }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
