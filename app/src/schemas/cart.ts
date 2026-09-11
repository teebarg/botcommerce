import { z } from "zod";
import { ShippingMethodSchema, PaymentMethodSchema, type PaymentMethod } from "./enums";
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
    user_id: z.number().optional(),
    user: UserMiniSchema.optional(),
    email: z.string().email().optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
    total: z.number(),
    subtotal: z.number(),
    tax: z.number(),
    wallet_used: z.number(),
    payment_method: PaymentMethodSchema.optional(),
    shipping_method: ShippingMethodSchema.optional(),
    shipping_fee: z.number(),
    shipping_address_id: z.number().optional(),
    shipping_address: AddressSchema.optional(),
    discount_amount: z.number().optional(),
    coupon_code: z.string().optional(),
    coupon_id: z.number().optional(),
    items: z.array(CartItemSchema),
    updated_at: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;

export type CartUpdate = {
    shipping_address?: Omit<Address, "id"> & { id?: number };
    email?: string;
    phone?: string;
    shipping_method?: number;
    payment_method?: PaymentMethod;
};

export interface CartListResponse {
    items: Cart[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
}
