import { serverApi } from "@/apis/server-client";
import { PaginatedProductSearch } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";

export const GetProductsFn = createServerFn({ method: "GET" })
    .inputValidator((data: any) => data)
    .handler(async ({ data }) => {
        console.log("🚀 ~ file: product.server.ts:8 ~ data:-----", data)
        const res = await serverApi.get<PaginatedProductSearch>("/product/", { params: { skip: 0, ...data } });
        return res;
    });
