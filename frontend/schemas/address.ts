import { z } from "zod";

import { AddressTypeSchema } from "./enums";
import { PagSchema } from "./common";

export const AddressSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    address_type: AddressTypeSchema,
    label: z.string().optional(),
    address_1: z.string(),
    address_2: z.string(),
    city: z.string(),
    postal_code: z.string(),
    state: z.string(),
    phone: z.string(),
    is_billing: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export const PaginatedAddressSchema = PagSchema.extend({
    addresses: z.array(AddressSchema),
});

export type Address = z.infer<typeof AddressSchema>;
export type PaginatedAddress = z.infer<typeof PaginatedAddressSchema>;
