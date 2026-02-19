import { z } from "zod";
import { OrderStatusSchema, ShippingMethodSchema, PaymentMethodSchema, PaymentStatusSchema } from "./enums";
import { UserSchema } from "./user";
import { AddressSchema } from "./address";
import { ProductVariantSchema } from "./product";
import { AuditSchema } from "./base";
import { CursorSchema } from "./common";

export const OrderItemSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        order_id: z.number(),
        variant_id: z.string(),
        variant: ProductVariantSchema,
        image: z.string().optional(),
        quantity: z.number(),
        price: z.number(),
    })
    .merge(AuditSchema);

export const OrderSchema = z
    .object({
        id: z.number(),
        order_number: z.string(),
        status: OrderStatusSchema,
        email: z.string(),
        phone: z.string().optional(),
        cart_id: z.string(),
        cart_number: z.string(),
        user_id: z.number(),
        user: UserSchema,
        order_items: z.array(OrderItemSchema),
        subtotal: z.number(),
        tax: z.number(),
        discount_amount: z.number(),
        shipping_fee: z.number(),
        total: z.number(),
        wallet_used: z.number(),
        coupon_code: z.string().optional(),
        shipping_address: AddressSchema,
        shipping_method: ShippingMethodSchema,
        payment_method: PaymentMethodSchema,
        payment_status: PaymentStatusSchema,
        invoice_url: z.string().optional(),
        order_notes: z.string().optional(),
    })
    .merge(AuditSchema);

export const PaginatedOrdersSchema = CursorSchema.extend({
    items: z.array(OrderSchema),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type PaginatedOrders = z.infer<typeof PaginatedOrdersSchema>;
