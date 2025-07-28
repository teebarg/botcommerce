import { z } from "zod";

import { PagSchema } from "./common";
import { UserSchema } from "./user";
import { ProductSchema } from "./product";
import { InteractionTypeSchema } from "./enums";

export const ActivitySchema = z.object({
    id: z.number(),
    user_id: z.number(),
    activity_type: z.string(),
    description: z.string(),
    action_download_url: z.string().optional(),
    is_success: z.boolean(),
    user: UserSchema,
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedActivitySchema = PagSchema.extend({
    activities: z.array(ActivitySchema),
});

export const UserInteractionSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    user: UserSchema,
    product_id: z.number(),
    product: ProductSchema,
    type: InteractionTypeSchema,
    metadata: z.any().nullable().optional(),
    timestamp: z.date().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type PaginatedActivity = z.infer<typeof PaginatedActivitySchema>;
export type UserInteraction = z.infer<typeof UserInteractionSchema>;
