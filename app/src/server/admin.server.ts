import type { StatsTrends } from "@/types/models";
import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";

export const getStatsTrendsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<StatsTrends>("/stats/trends", { from: "/admin" });
});
