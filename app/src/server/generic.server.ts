import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/api.server";

export const getShopSettingsPublicFn = createServerFn().handler(async () => {
    const res = await api.get<any>("/shop-settings/public");
    return res as Promise<any>
});
