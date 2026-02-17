import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/fetch-api";
import type { FAQ } from "@/schemas";

export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<FAQ[]>("/faq/");
});
