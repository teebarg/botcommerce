import { z } from "zod";
import { ShippingMethodSchema, PaymentMethodSchema, type PaymentMethod, CartStatusSchema } from "./enums";
import { ProductVariantSchema } from "./product";
import { type Address, AddressSchema } from "./address";
import { UserMiniSchema } from "./user";

export const CartItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    variant_id: z.number(),
    variant: ProductVariantSchema,
    image: z.string().optional(),
    quantity: z.number(),
});

export const CartSchema = z.object({
    id: z.number(),
    cart_number: z.string(),
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
    discount_amount: z.number().optional(),
    discounts: z.any().optional(),
    coupon_id: z.number().optional(),
    coupon_code: z.string().optional(),
    total: z.number(),
    shipping_address_id: z.number().optional(),
    shipping_address: AddressSchema.optional(),
    shipping_method: ShippingMethodSchema.optional(),
    payment_method: PaymentMethodSchema.optional(),
});

export const AbandonedCartSchema = z.object({
    id: z.number(),
    user: UserMiniSchema.optional(),
    email: z.string().email().optional(),
    cart_number: z.string(),
    status: CartStatusSchema,
    items: z.array(CartItemSchema),
    total: z.number(),
    subtotal: z.number(),
    tax: z.number(),
    shipping_fee: z.number(),
    wallet_used: z.number(),
    created_at: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type AbandonedCart = z.infer<typeof AbandonedCartSchema>;

export type CartUpdate = {
    shipping_address?: Omit<Address, "id"> & { id?: number };
    email?: string;
    phone?: string;
    shipping_method?: number;
    payment_method?: PaymentMethod;
};
