import { serverApi } from "@/apis/server-client";
import { StatsTrends } from "@/types/models";
import { createServerFn } from "@tanstack/react-start";

export const getStatsTrendsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await serverApi.get<StatsTrends>("/stats/trends");

});
