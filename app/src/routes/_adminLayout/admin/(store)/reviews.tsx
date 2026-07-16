import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_adminLayout/admin/(store)/reviews")({
    validateSearch: z.object({
        search: z.string().optional(),
        product_id: z.number().optional(),
        sort: z.string().optional(),
    }),
});
