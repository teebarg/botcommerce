"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/apis";
import { User } from "@/schemas";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    error: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await api.user.me();
            setUser(data);
            setError(error);
            setLoading(false);
        };

        fetchUser();
    }, []);

    return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
