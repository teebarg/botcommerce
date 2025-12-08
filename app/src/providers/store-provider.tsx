import type React from "react";
import { createContext, useContext } from "react";
import { siteConfigQuery } from "@/hooks/useGeneric";
import z from "zod";
import { useQuery } from "@tanstack/react-query";

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
    feature_whatsapp: z.string().optional(),
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
    const { data } = useQuery(siteConfigQuery)
    return <StoreContext.Provider value={{ config: data }}>{children}</StoreContext.Provider>;
};

export const useConfig = () => {
    const ctx = useContext(StoreContext);

    if (!ctx) throw new Error("useConfig must be used within a StoreProvider");

    return ctx;
};
