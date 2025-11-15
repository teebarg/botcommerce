import { z } from "zod";

import {
    ShippingMethodSchema,
    PaymentMethodSchema,
    CartStatus,
    ShippingMethod,
    PaymentMethod,
    OrderStatus,
    PaymentStatus,
    CartStatusSchema,
} from "./enums";
import { ProductVariantSchema } from "./product";
import { Address, AddressSchema } from "./address";
import { AuditSchema } from "./base";
import { UserSchema } from "./user";

export const CartItemSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        variant_id: z.number(),
        variant: ProductVariantSchema,
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
        status: CartStatusSchema,
        items: z.array(CartItemSchema),
        checkout_step: z.enum(["address", "delivery", "payment"]).default("address").optional(),
        subtotal: z.number(),
        tax: z.number(),
        shipping_fee: z.number(),
        discount_amount: z.number().optional(),
        discounts: z.any().optional(),
        coupon_id: z.number().optional(),
        total: z.number(),
        billing_address: AddressSchema.optional(),
        shipping_address_id: z.number().optional(),
        shipping_address: AddressSchema.optional(),
        shipping_method: ShippingMethodSchema.optional(),
        payment_method: PaymentMethodSchema.optional(),
        gift_cards: z.any().optional(),
    })
    .merge(AuditSchema);

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;

export type CartUpdate = {
    status?: CartStatus;
    shipping_address?: Omit<Address, "id"> & { id?: number };
    email?: string;
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
