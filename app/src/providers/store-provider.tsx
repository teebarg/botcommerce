import type React from "react";
import { createContext, useContext } from "react";
import z from "zod";
import { useRouteContext } from "@tanstack/react-router";

const ConfigTypeSchema = z.object({
    shop_name: z.string().optional(),
    shop_email: z.string().optional(),
    shop_description: z.string().optional(),
    address: z.string().optional(),
    contact_email: z.string().optional(),
    contact_phone: z.string().optional(),
    email_bcc: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
    whatsapp: z.string().optional(),
    tax_rate: z.string().optional(),
    feature_reviews: z.string().optional(),
    feature_chatbot: z.string().optional(),
    feature_wishlist: z.string().optional(),
    payment_bank: z.string().optional(),
    payment_card: z.string().optional(),
    payment_cash: z.string().optional(),
    payment_paystack: z.string().optional(),
})

type ConfigType = z.infer<typeof ConfigTypeSchema>

type StoreContextType = {
    config?: ConfigType;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const { config } = useRouteContext({ strict: false });
    return <StoreContext.Provider value={{ config }}>{children}</StoreContext.Provider>;
};

export const useConfig = () => {
    const ctx = useContext(StoreContext);

    if (!ctx) throw new Error("useConfig must be used within a StoreProvider");

    return ctx;
};
