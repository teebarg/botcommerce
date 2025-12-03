import { serverApi } from "@/apis/server-client";
import { PaginatedProductSearch } from "@/schemas";
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
