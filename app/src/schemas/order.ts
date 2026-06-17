import { z } from "zod";
import { OrderStatusSchema, ShippingMethodSchema, PaymentMethodSchema, PaymentStatusSchema } from "./enums";
import { UserSchema } from "./user";
import { AddressSchema } from "./address";
import { ProductVariantLiteSchema } from "./product";
import { CursorSchema } from "./common";

export const OrderItemSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        variant: ProductVariantLiteSchema,
        image: z.string().optional(),
        quantity: z.number(),
        price: z.number(),
    });

export const OrderSchema = z
    .object({
        id: z.number(),
        email: z.string(),
        phone: z.string().optional(),
        order_number: z.string(),
        user: UserSchema,
        shipping_address: AddressSchema,
        total: z.number(),
        subtotal: z.number(),
        tax: z.number(),
        discount_amount: z.number(),
        wallet_used: z.number(),
        status: OrderStatusSchema,
        payment_status: PaymentStatusSchema,
        shipping_method: ShippingMethodSchema,
        payment_method: PaymentMethodSchema,
        shipping_fee: z.number(),
        coupon_code: z.string().optional(),
        order_items: z.array(OrderItemSchema),
        order_notes: z.string().optional(),
        invoice_url: z.string().optional(),
        created_at: z.string(),
    });

export const PaginatedOrdersSchema = CursorSchema.extend({
    items: z.array(OrderSchema),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type PaginatedOrders = z.infer<typeof PaginatedOrdersSchema>;
