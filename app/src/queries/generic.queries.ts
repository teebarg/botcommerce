import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/api";

export const getShopSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Record<string, string>>("/shop-settings/");
});
