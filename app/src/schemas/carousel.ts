import { z } from "zod";
import { AuditSchema } from "./base";

export const CarouselBannerSchema = z
    .object({
        id: z.number(),
        title: z.string(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        buttonText: z.string().optional(),
        image: z.string(),
        link: z.string().optional(),
        order: z.number(),
        is_active: z.boolean(),
    })
    .merge(AuditSchema);

export type CarouselBanner = z.infer<typeof CarouselBannerSchema>;
