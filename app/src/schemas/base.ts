import { z } from "zod";

export const AuditSchema = z.object({
    created_at: z.string(),
    updated_at: z.string(),
});
