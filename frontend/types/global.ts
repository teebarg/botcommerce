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
    discount_total: number;
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

export type SiteConfig = {
    id: number;
    key: string;
    value: string;
    created_at: string;
    updated_at: string;
};

export type IconProps = {
    color?: string;
    size?: string | number;
} & React.SVGAttributes<SVGElement>;
