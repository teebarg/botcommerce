import { createFileRoute } from "@tanstack/react-router";
import { OrderStatusSchema } from "@/schemas";
import z from "zod";

export const Route = createFileRoute("/_adminLayout/admin/(store)/orders")({
    validateSearch: z.object({
        search: z.string().optional(),
        status: OrderStatusSchema.optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
    }),
});
