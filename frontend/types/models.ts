import { z } from "zod";

import {
    ProductSchema,
    PaginatedProductSchema,
    UserSchema,
    WishlistSchema,
    WishItemSchema,
    TokenSchema,
    FacetSchema,
    PaginatedCategorySchema,
    CategorySchema,
    PaginatedCollectionSchema,
    CollectionSchema,
    ReviewSchema,
    PaginatedReviewSchema,
    SessionSchema,
    BrandSchema,
    PaginatedBrandSchema,
    PagSchema,
    CartItemSchema,
    CartSchema,
    OrderSchema,
    SiteConfigSchema,
    PaginatedSiteConfigSchema,
    PaginatedOrderSchema,
    MessageSchema,
    ProductVariantSchema,
    ProductImageSchema,
    ProductSearchSchema,
    PaginatedProductSearchSchema,
    ProductStatusSchema,
    OrderStatusSchema,
    CartStatusSchema,
    DiscountTypeSchema,
    PaymentMethodSchema,
    PaymentStatusSchema,
    RoleSchema,
    ShippingMethodSchema,
    StatusSchema,
    AddressSchema,
    OrderItemSchema,
    PaginatedAddressSchema,
    DeliveryOptionSchema,
    PaginationSchema,
    PaystackResponseSchema,
    AddressTypeSchema,
    ShopSettingsTypeSchema,
    ShopSettingsSchema,
    BankDetailsSchema,
    PaginatedUserSchema,
    ActivitySchema,
    PaginatedActivitySchema,
    FAQSchema,
    ConversationSchema,
    ChatMessageSchema,
    ConversationStatusSchema,
    MessageSenderSchema,
    PaginatedConversationSchema,
} from "./schema";

export type Activity = z.infer<typeof ActivitySchema>;
export type PaginatedActivity = z.infer<typeof PaginatedActivitySchema>;

export type Facet = z.infer<typeof FacetSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type PaginatedBrand = z.infer<typeof PaginatedBrandSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type PaginatedCollection = z.infer<typeof PaginatedCollectionSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type PaginatedCategory = z.infer<typeof PaginatedCategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;
export type PaginatedProduct = z.infer<typeof PaginatedProductSchema>;
export type PaginatedProductSearch = z.infer<typeof PaginatedProductSearchSchema>;
export type User = z.infer<typeof UserSchema>;
export type PaginatedUser = z.infer<typeof PaginatedUserSchema>;
export type Wishlist = z.infer<typeof WishlistSchema>;
export type WishItem = z.infer<typeof WishItemSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type PaginatedReview = z.infer<typeof PaginatedReviewSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Pag = z.infer<typeof PagSchema>;
export type DeliveryOption = z.infer<typeof DeliveryOptionSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

// cart
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type PaginatedOrder = z.infer<typeof PaginatedOrderSchema>;

export type Message = z.infer<typeof MessageSchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type PaginatedSiteConfig = z.infer<typeof PaginatedSiteConfigSchema>;
// export type PaginatedProduct = z.infer<typeof PaginatedProductSchema>;

export type ProductImage = z.infer<typeof ProductImageSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type PaginatedAddress = z.infer<typeof PaginatedAddressSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// Infer TypeScript types from Zod schemas
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type DiscountType = z.infer<typeof DiscountTypeSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type CartStatus = z.infer<typeof CartStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type AddressType = z.infer<typeof AddressTypeSchema>;
export type ShopSettingsType = z.infer<typeof ShopSettingsTypeSchema>;
export type ShopSettings = z.infer<typeof ShopSettingsSchema>;
export type BankDetails = z.infer<typeof BankDetailsSchema>;

export type PaystackResponse = z.infer<typeof PaystackResponseSchema>;

export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;
export type MessageSender = z.infer<typeof MessageSenderSchema>;

export type FAQ = z.infer<typeof FAQSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type PaginatedConversation = z.infer<typeof PaginatedConversationSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// custom
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

export enum FileTypes {
    png = "image/png",
    jpeg = "image/jpeg",
    jpg = "image/jpg",
    avif = "image/avif",
    csv = "text/csv",
    xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls = "application/vnd.ms-excel",
}

export type SortOptions = "price_asc" | "price_desc" | "created_at";

export type IconProps = {
    color?: string;
    size?: string | number;
} & React.SVGAttributes<SVGElement>;

export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    productsGrowth: number;
    customersGrowth: number;
}

export interface DashboardTrend {
    date: string; // format: "YYYY-MM" or "YYYY-MM-DD" depending on granularity
    orders: number;
    signups: number;
}

export interface StatsTrends {
    summary: DashboardSummary;
    trends: DashboardTrend[];
}
