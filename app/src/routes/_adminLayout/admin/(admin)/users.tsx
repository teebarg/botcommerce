import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_adminLayout/admin/(admin)/users")({
    validateSearch: z.object({
        sort: z.enum(["asc", "desc"]).optional(),
        query: z.string().optional(),
        role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
    }),
});
