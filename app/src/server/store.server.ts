import { createServerFn } from "@tanstack/react-start";
import type { Collection } from "@/schemas";
import { api } from "@/utils/api";

export const getCollectionFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => await api.get<Collection>(`/collection/${data}`));
