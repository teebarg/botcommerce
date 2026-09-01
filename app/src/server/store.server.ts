import { createServerFn } from "@tanstack/react-start";
import type { Collection } from "@/schemas";
import { api } from "@/utils/api";

export const getCollectionFn = createServerFn()
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        return await api.get<Collection>(`/collection/${data}`);
    });
