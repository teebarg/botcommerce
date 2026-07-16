import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_adminLayout/admin/(store)/coupons")({
    validateSearch: z.object({
        query: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});
