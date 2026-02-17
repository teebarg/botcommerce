import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/fetch-api";
import type { Address } from "@/schemas";

export const getUserAddressesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<{ addresses: Address[] }>("/address/");
});
