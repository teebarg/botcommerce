import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/utils/fetch-api";
import type { Address, Message } from "@/schemas";

const AddressInputSchema = z.any();

export const getUserAddressesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<{ addresses: Address[] }>("/address/");
});

export const createAddressFn = createServerFn({ method: "POST" })
    .inputValidator(AddressInputSchema)
    .handler(async ({ data: input }) => {
        return await api.post<Address>("/address/", input);
    });

export const updateAddressFn = createServerFn({ method: "POST" }) // RPC call uses POST
    .inputValidator(
        z.object({
            id: z.number(),
            input: AddressInputSchema,
        })
    )
    .handler(async ({ data }) => {
        return await api.patch<Address>(`/address/${data.id}`, data.input);
    });

export const deleteAddressFn = createServerFn({ method: "POST" }) // RPC call uses POST
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<Message>(`/address/${id}`);
    });
