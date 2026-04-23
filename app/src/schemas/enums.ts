import { z } from "zod";

export const AddressTypeSchema = z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]);
export const OrderStatusSchema = z.enum(["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELED", "REFUNDED"]);
export const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);
export const PaymentMethodSchema = z.enum(["CREDIT_CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER", "PAYSTACK", "COUPON", "WALLET"]);
export const ProductStatusSchema = z.enum(["IN_STOCK", "OUT_OF_STOCK"]);
export const CartStatusSchema = z.enum(["ACTIVE", "ABANDONED", "CONVERTED"]);
export const PaymentStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]);
export const ShippingMethodSchema = z.enum(["STANDARD", "EXPRESS", "PICKUP"]);
export const RoleSchema = z.enum(["ADMIN", "CUSTOMER"]);
export const ShopSettingsTypeSchema = z.enum(["FEATURE", "SHOP_DETAIL", "CUSTOM"]);
export const ConversationStatusSchema = z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]);
export const MessageSenderSchema = z.enum(["USER", "BOT", "SYSTEM"]);
export const SortBySchema = z.enum(["newest", "oldest", "highest", "lowest"]);
export const InteractionTypeSchema = z.enum(["VIEW", "PURCHASE", "CART_ADD", "WISHLIST_ADD", "WISHLIST_REMOVE"]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type DiscountType = z.infer<typeof DiscountTypeSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type CartStatus = z.infer<typeof CartStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;
export type SortBy = z.infer<typeof SortBySchema>;

export enum MessageSender {
  USER = "USER",
  BOT = "BOT",
  SYSTEM = "SYSTEM"
}
