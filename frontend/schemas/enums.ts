import { z } from "zod";

export const AddressTypeSchema = z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]);
export const OrderStatusSchema = z.enum(["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELED", "PAID", "REFUNDED"]);
export const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);
export const PaymentMethodSchema = z.enum(["CREDIT_CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER", "PAYSTACK"]);
export const ProductStatusSchema = z.enum(["IN_STOCK", "OUT_OF_STOCK"]);
export const CartStatusSchema = z.enum(["ACTIVE", "ABANDONED", "CONVERTED"]);
export const PaymentStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]);
export const ShippingMethodSchema = z.enum(["STANDARD", "EXPRESS", "PICKUP"]);
export const RoleSchema = z.enum(["admin", "customer"]);
export const StatusSchema = z.enum(["PENDING", "ACTIVE", "INACTIVE"]);
export const ShopSettingsTypeSchema = z.enum(["FEATURE", "SHOP_DETAIL", "CUSTOM"]);
export const ConversationStatusSchema = z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]);
export const MessageSenderSchema = z.enum(["USER", "BOT", "SYSTEM"]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type DiscountType = z.infer<typeof DiscountTypeSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type CartStatus = z.infer<typeof CartStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type ShopSettingsType = z.infer<typeof ShopSettingsTypeSchema>;
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;
export type MessageSender = z.infer<typeof MessageSenderSchema>;
export type AddressType = z.infer<typeof AddressTypeSchema>;
