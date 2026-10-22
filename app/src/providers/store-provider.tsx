import type React from "react";
import { createContext, useContext } from "react";
import z from "zod";

const ConfigTypeSchema = z.object({
    shop_name: z.string(),
    shop_email: z.string(),
    frontend_host: z.string(),
    shop_description: z.string(),
    address: z.string(),
    contact_email: z.string(),
    contact_phone: z.string(),
    email_bcc: z.string(),
    facebook: z.string(),
    instagram: z.string(),
    twitter: z.string(),
    tiktok: z.string(),
    whatsapp: z.string(),
    telegram: z.string(),
    tax_rate: z.string(),
    feature_reviews: z.string(),
    feature_chatbot: z.string(),
    payment_bank: z.string(),
    payment_cash: z.string(),
    payment_paystack: z.string(),
    bank_name: z.string(),
    account_name: z.string(),
    account_number: z.string(),
});

type ConfigType = z.infer<typeof ConfigTypeSchema>;

const StoreContext = createContext<ConfigType | undefined>(undefined);

export const StoreProvider = ({ config, children }: { config: ConfigType | undefined; children: React.ReactNode }) => {
    return <StoreContext.Provider value={config}>{children}</StoreContext.Provider>;
};

export const useConfig = () => {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useConfig must be used within a StoreProvider");
    return ctx;
};
