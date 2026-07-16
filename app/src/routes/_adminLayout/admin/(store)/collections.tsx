import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_adminLayout/admin/(store)/collections")({
    validateSearch: z.object({
        search: z.string().optional(),
    }),
});
