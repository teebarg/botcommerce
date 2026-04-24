import { z } from "zod";
import { AddressTypeSchema } from "./enums";

export const AddressSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    address_type: AddressTypeSchema,
    label: z.string().optional(),
    address_1: z.string(),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string(),
    phone: z.string(),
    is_billing: z.boolean().optional(),
    created_at: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;
