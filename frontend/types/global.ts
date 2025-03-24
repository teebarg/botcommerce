import { Category, ShippingMethod } from "@/lib/models";

export enum FileTypes {
    png = "image/png",
    jpeg = "image/jpeg",
    jpg = "image/jpg",
    avif = "image/avif",
    csv = "text/csv",
    xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls = "application/vnd.ms-excel",
}

export type DeliveryOption = {
    id: ShippingMethod;
    name: string;
    amount: number;
    amount_str: string;
    description: string;
};

export type PaymentSession = {
    id: string;
    provider_id: string;
};

export type SortOptions = "price_asc" | "price_desc" | "created_at";

export type Address = {
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
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

export type Pagination = {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
};

export interface Review {
    id: number;
    rating: number;
    comment: string;
    verified: boolean;
    product_id: number;
    user_id: number;
}

export interface Order {
    id: number;
    user_id: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
}

export interface ExtendedOrder extends Order {
    order_items: OrderItem[];
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
}

export interface ExtendedUser extends User {
    reviews: Review[];
    orders: Order[];
}
