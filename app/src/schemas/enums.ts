import { z } from "zod";

export const AddressTypeSchema = z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]);
export const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);
export const ProductStatusSchema = z.enum(["IN_STOCK", "OUT_OF_STOCK"]);
export const CartStatusSchema = z.enum(["ACTIVE", "ABANDONED", "CONVERTED"]);
export const PaymentStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]);
export const ShippingMethodSchema = z.enum(["STANDARD", "EXPRESS", "PICKUP"]);
export const RoleSchema = z.enum(["ADMIN", "CUSTOMER"]);
export const ShopSettingsTypeSchema = z.enum(["FEATURE", "SHOP_DETAIL", "CUSTOM"]);
export const MessageSenderSchema = z.enum(["USER", "BOT", "SYSTEM"]);
export const SortBySchema = z.enum(["newest", "oldest", "highest", "lowest"]);

export type DiscountType = z.infer<typeof DiscountTypeSchema>;
export type CartStatus = z.infer<typeof CartStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type SortBy = z.infer<typeof SortBySchema>;

export enum MessageSender {
  USER = "USER",
  BOT = "BOT",
  SYSTEM = "SYSTEM"
}

export const ConversationStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;

export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus];
export const ConversationStatusSchema = z.enum([
  ConversationStatus.ABANDONED,
  ConversationStatus.ACTIVE,
  ConversationStatus.COMPLETED,
]);


export const OrderStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
  REFUNDED: "REFUNDED",
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
export const OrderStatusSchema = z.enum([
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELED,
  OrderStatus.REFUNDED,
]);


export const PaymentMethod = {
  CREDIT_CARD: "CREDIT_CARD",
  CASH_ON_DELIVERY: "CASH_ON_DELIVERY",
  BANK_TRANSFER: "BANK_TRANSFER",
  PAYSTACK: "PAYSTACK",
  COUPON: "COUPON",
  WALLET: "WALLET",
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
export const PaymentMethodSchema = z.enum([
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.CASH_ON_DELIVERY,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.PAYSTACK,
  PaymentMethod.COUPON,
  PaymentMethod.WALLET,
]);
