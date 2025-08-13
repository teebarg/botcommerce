import { z } from "zod";

import { AddressSchema } from "./address";
import { AuditSchema } from "./base";

import { PagSchema } from "./index";

export const UserSchema = z
    .object({
        id: z.number(),
        first_name: z.string(),
        last_name: z.string().optional(),
        email: z.string().email(),
        emailVerified: z.string(),
        status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
        hashed_password: z.string(),
        image: z.string().optional(),
        role: z.enum(["ADMIN", "CUSTOMER"]),
        // addresses: z.array(z.lazy(() => AddressSchema)).optional(),
        addresses: z.array(AddressSchema).optional(),
        orders: z.array(z.any()).optional(),
    })
    .merge(AuditSchema);

export const PaginatedUserSchema = PagSchema.extend({
    users: z.array(UserSchema),
});

export const SessionSchema = z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string(),
    image: z.string().nullable().optional(),
    // phone: z.string().optional(),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
    role: z.enum(["ADMIN", "CUSTOMER"]),
});

export type User = z.infer<typeof UserSchema>;
export type PaginatedUser = z.infer<typeof PaginatedUserSchema>;
export type Session = z.infer<typeof SessionSchema>;
