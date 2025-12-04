import { serverApi } from "@/apis/server-client";
import { Collection, PaginatedProductSearch } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const oauthSchema = z.object({
    redirectTo: z.string().optional(),
});

export const GetProductsFn = createServerFn({ method: "GET" })
    .inputValidator((data: any) => data)
    .handler(async ({ data }) => {
        const res = await serverApi.get<PaginatedProductSearch>("/product/", { params: { skip: 0, ...data } });
        return res;
    });


export const getCollectionFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await serverApi.get<Collection>(`/collection/${data}`);
        return res;
    });
