import { createServerFn } from "@tanstack/react-start";
import type { Collection } from "@/schemas";
import { api } from "@/utils/api";
import { setResponseHeaders } from "@tanstack/react-start/server";

export const getCollectionFn = createServerFn()
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<Collection>(`/collection/${data}`);

        setResponseHeaders(
            new Headers({
                "Cache-Control": "no-store",
                "Vercel-CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
                "Vercel-Cache-Tag": `collection:${data}`,
            }),
        );

        return res;
    });
