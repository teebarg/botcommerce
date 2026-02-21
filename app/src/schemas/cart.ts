import { z } from "zod";

import {
    ShippingMethodSchema,
    PaymentMethodSchema,
    type CartStatus,
    type ShippingMethod,
    type PaymentMethod,
    type OrderStatus,
    type PaymentStatus,
    CartStatusSchema,
} from "./enums";
import { ProductVariantLiteSchema } from "./product";
import { type Address, AddressSchema } from "./address";
import { AuditSchema } from "./base";
import { UserSchema } from "./user";
import { CursorSchema } from "./common";

export const CartItemSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        variant_id: z.number(),
        variant: ProductVariantLiteSchema,
        image: z.string().optional(),
        quantity: z.number(),
        price: z.number(),
    })
    .merge(AuditSchema);

export const CartSchema = z
    .object({
        id: z.number(),
        cart_number: z.string(),
        user_id: z.number().optional(),
        user: UserSchema.optional(),
        email: z.string().email().optional(),
        phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/)
            .optional(),
        status: CartStatusSchema,
        items: z.array(CartItemSchema),
        subtotal: z.number(),
        tax: z.number(),
        shipping_fee: z.number(),
        wallet_used: z.number(),
        discount_amount: z.number(),
        discounts: z.any().optional(),
        coupon_id: z.number().optional(),
        coupon_code: z.string().optional(),
        total: z.number(),
        shipping_address_id: z.number().optional(),
        shipping_address: AddressSchema.optional(),
        shipping_method: ShippingMethodSchema.optional(),
        payment_method: PaymentMethodSchema.optional(),
    })
    .merge(AuditSchema);

export const PaginatedAbandonedCartsSchema = CursorSchema.extend({
    items: z.array(CartSchema),
})

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type PaginatedAbandonedCarts = z.infer<typeof PaginatedAbandonedCartsSchema>;

export type CartUpdate = {
    status?: CartStatus;
    shipping_address?: Omit<Address, "id"> & { id?: number };
    email?: string;
    phone?: string;
    billing_address?: Omit<Address, "id">;
    shipping_method?: ShippingMethod;
    payment_method?: PaymentMethod;
    total?: number;
    subtotal?: number;
    tax?: number;
    shipping_fee?: number;
};

export type CartComplete = {
    coupon_id?: number;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
};
