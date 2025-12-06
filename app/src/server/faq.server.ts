import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/utils/fetch-api";
import type { FAQ, Message } from "@/schemas";
import type { FaqFormValues } from "@/components/admin/faq/faq-form";

// Using z.custom since the FaqFormValues schema definition is not provided
const FaqFormValuesSchema = z.custom<FaqFormValues>();

const UpdateFaqPayloadSchema = z.object({
    id: z.number(),
    data: FaqFormValuesSchema,
});

export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<FAQ[]>("/faq/");
});

export const createFaqFn = createServerFn({ method: "POST" })
    .inputValidator(FaqFormValuesSchema)
    .handler(async ({ data }) => {
        return await api.post<Message>("/faq", data);
    });

export const updateFaqFn = createServerFn({ method: "POST" })
    .inputValidator(UpdateFaqPayloadSchema)
    .handler(async ({ data }) => {
        return await api.patch<Message>(`/faq/${data.id}`, data.data);
    });

export const deleteFaqFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<FAQ>(`/faq/${id}`);
    });
