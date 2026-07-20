import { z } from "zod";
import { AddressTypeSchema } from "./enums";
import { phoneSchema } from "./common";

export const addressSchema = z.object({
    address_type: AddressTypeSchema,
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    address_2: z.string().optional(),
    state: z.string().min(1, "State is required"),
    phone: phoneSchema,
});

export const AddressSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    address_type: AddressTypeSchema,
    label: z.string().optional(),
    address_1: z.string(),
    address_2: z.string().optional(),
    state: z.string(),
    phone: z.string(),
    created_at: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;
