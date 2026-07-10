import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { ShopSettings } from "@/schemas";
import { api } from "@/utils/api";

export const getShopSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
    const res = await api.get<ShopSettings[]>("/shop-settings/");

    setResponseHeaders(
        new Headers({
            "Cache-Control": "public, max-age=300",
            "Vercel-CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            "Vercel-Cache-Tag": "shop-settings",
        }),
    );

    return res;
});