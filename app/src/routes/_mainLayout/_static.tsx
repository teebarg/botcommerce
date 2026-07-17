import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static")({
    preload: false,
    headers: () => ({
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Vercel-CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Vercel-Cache-Tag": "shop-settings",
    }),
    component: () => <Outlet />,
});