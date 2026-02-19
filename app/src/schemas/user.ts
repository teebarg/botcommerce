import { z } from "zod";

import { AddressSchema } from "./address";
import { AuditSchema } from "./base";

import { CursorSchema, PagSchema } from "./index";

export const UserLiteSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string().email(),
    role: z.enum(["ADMIN", "CUSTOMER"]),
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
    image: z.string().optional(),
});

export const WalletTxnLiteSchema = z.object({
    id: z.string(),
    amount: z.number(),
    type: z.enum(["CASHBACK", "WITHDRAWAL", "ADJUSTMENT", "REVERSAL"]),
    reference_id: z.string().optional(),
    reference_code: z.string().optional(),
    created_at: z.string(),
});

export const WalletTxnSchema = z.object({
    id: z.string(),
    user_id: z.number(),
    user: UserLiteSchema,
    amount: z.number(),
    type: z.enum(["CASHBACK", "WITHDRAWAL", "ADJUSTMENT", "REVERSAL"]),
    reference_id: z.string().optional(),
    reference_code: z.string().optional(),
    created_at: z.string(),
});

export const PaginatedWalletTxnsSchema = CursorSchema.extend({
    txns: z.array(WalletTxnSchema),
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
        wallet_balance: z.number(),
    })
    .merge(AuditSchema);

export const PaginatedUsersSchema = CursorSchema.extend({
    items: z.array(UserSchema),
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

export type WalletTxn = z.infer<typeof WalletTxnSchema>;
export type PaginatedWalletTxns = z.infer<typeof PaginatedWalletTxnsSchema>;
export type User = z.infer<typeof UserSchema>;
export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;

import type { AuthSession as AuthjsSession } from "start-authjs";

export type AuthSession = AuthjsSession & {
    id: number;
    accessToken: string;
};
