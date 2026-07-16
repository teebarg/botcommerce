import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_adminLayout/admin/(store)/abandoned-carts")({
    validateSearch: z.object({
        search: z.string().optional(),
        time: z.string().optional(),
    }),
});
