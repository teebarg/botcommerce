"use client";

import React, { createContext, useContext } from "react";
import type { Session } from "next-auth";

import { User } from "@/schemas";
import { useMe } from "@/lib/hooks/useUser";

type AuthContextType = {
    user?: User | null;
    session?: Session | null;
    loading: boolean;
    error: any;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, session }: { children: React.ReactNode, session: Session | null }) => {
    const { data: user, isLoading, error } = useMe();

    return <AuthContext.Provider value={{ user, session, loading: isLoading, error, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);

    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");

    return ctx;
};
