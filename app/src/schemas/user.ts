import { z } from "zod";

import { AddressSchema } from "./address";
import { AuditSchema } from "./base";

import { PagSchema } from "./index";

export const WalletTrnxSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    amount: z.number(),
    type: z.enum(["CASHBACK", "WITHDRAWAL", "ADJUSTMENT", "REVERSAL"]),
    referenceId: z.string(),
    created_at: z.string(),
});

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
        referral_code: z.string().optional(),
        wallet_balance: z.number().optional(),
        // addresses: z.array(z.lazy(() => AddressSchema)).optional(),
        addresses: z.array(AddressSchema).optional(),
        orders: z.array(z.any()).optional(),
        walletTxns: z.array(WalletTrnxSchema)
    })
    .merge(AuditSchema);

export const PaginatedUserSchema = PagSchema.extend({
    users: z.array(UserSchema),
});

export const SessionSchema = z.object({
    id: z.number().optional(),
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string(),
    image: z.string().nullable().optional(),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
    role: z.enum(["ADMIN", "CUSTOMER"]),
    addresses: z.array(AddressSchema).optional(),
    impersonated: z.boolean().optional(),
    impersonatedBy: z.string().optional(),
});

export const UserSessionSchema = z.object({
    id: z.number().optional(),
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string(),
    image: z.string().nullable().optional(),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
    role: z.enum(["ADMIN", "CUSTOMER"]),
    addresses: z.array(AddressSchema).optional(),
    impersonated: z.boolean().optional(),
    impersonatedBy: z.string().optional(),
});

export type WalletTrnx = z.infer<typeof WalletTrnxSchema>;
export type User = z.infer<typeof UserSchema>;
export type PaginatedUser = z.infer<typeof PaginatedUserSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;

import type { AuthSession as AuthjsSession } from "start-authjs";

export type AuthSession = AuthjsSession & {
    id: number,
    accessToken: string
};
