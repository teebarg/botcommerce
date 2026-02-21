import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/api.server";
import type { FAQ } from "@/schemas";

export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<FAQ[]>("/faq/");
});
