import { z } from "zod";
import { CursorSchema } from "./common";
import { UserLiteSchema } from "./user";

export const ActivitySchema = z.object({
    id: z.number(),
    user_id: z.number(),
    activity_type: z.string(),
    description: z.string(),
    action_download_url: z.string().optional(),
    is_success: z.boolean(),
    user: UserLiteSchema,
    created_at: z.string(),
});

export const PaginatedActivitiesSchema = CursorSchema.extend({
    items: z.array(ActivitySchema),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type PaginatedActivities = z.infer<typeof PaginatedActivitiesSchema>;
