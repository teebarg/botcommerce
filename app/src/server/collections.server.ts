import { api } from "@/utils/api.server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Collection } from "@/schemas";

export const getCollectionFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<Collection>(`/collection/${data}`);
        return res;
    });

export const getCollectionsFn = createServerFn({ method: "GET" })
    .inputValidator(z.string().optional())
    .handler(async ({ data: query }) => api.get<Collection[]>("/collection/", { params: { query: query || "" } }));
