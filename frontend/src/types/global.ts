export type Customer = {
    id: number;
    firstname: string;
    lastname?: string;
    email?: string;
    phone?: string;
    is_active?: boolean;
    is_superuser?: number;
    created_at?: string;
    billing_addresses?: Record<string, any>[];
    shipping_addresses?: Record<string, any>[];
};

export type Product = {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    old_price: number;
    image: string;
    images?: string[];
    is_active?: boolean;
    ratings?: number;
    inventory?: number;
    created_at?: string;
    collections: string[];
};

export type Collection = {
    id: number;
    name: string;
    slug?: string;
    created_at: string;
};

export type FeaturedProduct = {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
};

export type ProductPreviewType = {
    id: string;
    title: string;
    slug: string | null;
    thumbnail: string | null;
    created_at?: Date;
    price?: {
        calculated_price: string;
        original_price: string;
        difference: string;
        price_type: "default" | "sale";
    };
    isFeatured?: boolean;
};

export type ProductCollectionWithPreviews = Omit<any, "products"> & {
    products: ProductPreviewType[];
};

export type InfiniteProductPage = {
    response: {
        products: any[];
        count: number;
    };
};

export type ProductVariantInfo = Pick<any, "prices">;

export type CartWithCheckoutStep = Omit<any, "beforeInsert" | "beforeUpdate" | "afterUpdateOrLoad"> & {
    checkout_step: "address" | "delivery" | "payment";
};

export type ProductCategoryWithChildren = Omit<any, "category_children"> & {
    category_children: any[];
    category_parent?: any;
};

export type User = {
    id: number;
    firstname: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
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

export type Cart = {
    cart_id: string;
    customer_id: string;
    email: string;
    items: CartItem[];
    checkout_step?: "address" | "delivery" | "payment";
    subtotal: number;
    tax_total: number;
    delivery_fee: number;
    total: number;
    billing_address: Record<string, any>;
    shipping_address: Record<string, any>;
    shipping_method: any;
    payment_session: any;
    gift_cards: any;
};

export type CartItem = {
    item_id: string;
    product_id: string;
    slug: string;
    name: string;
    description?: string;
    image?: string;
    quantity: number;
    price: number;
    created_at: string;
};

export type DeliveryOption = {
    id: string;
    name: string;
    amount: number;
};

export type PaymentSession = {
    id: string;
    provider_id: string;
};

export type Order = {
    order_id: string;
    status?: "pending" | "processing" | "fulfilled";
    fulfillment_status: "fulfilled" | "not_fulfilled";
    cart_id: string;
    customer_id: string;
    email: string;
    line_items: CartItem[];
    checkout_step?: "address" | "delivery" | "payment";
    subtotal: number;
    tax_total: number;
    delivery_fee: number;
    total: number;
    billing_address: Record<string, any>;
    shipping_address: Record<string, any>;
    shipping_method: Record<string, any>;
    payment_session: Record<string, any>;
    fulfillments: Record<string, any>[];
    payment_status: "pending" | "paid";
    created_at: string;
};

export type SortOptions = "price_asc" | "price_desc" | "created_at";

export type Address = {
    created_at: string;
    updated_at: string;
    firstname: string;
    lastname: string;
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
    state: string;
    phone: string;
    id: string;
};
