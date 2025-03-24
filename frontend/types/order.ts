export enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    FULFILLED = "FULFILLED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    created_at: string;
    updated_at: string;
    product: {
        id: number;
        name: string;
        sku: string;
        price: number;
    };
}

export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    shipping_address_id: number;
    billing_address_id: number;
    status: OrderStatus;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
    customer: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    shipping_address: {
        id: number;
        first_name: string;
        last_name: string;
        address_1: string;
        address_2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        phone?: string;
    };
    billing_address: {
        id: number;
        first_name: string;
        last_name: string;
        address_1: string;
        address_2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        phone?: string;
    };
}

export interface OrderListResponse {
    total: number;
    page: number;
    limit: number;
    orders: Order[];
}

export interface OrderCreate {
    customer_id: number;
    shipping_address_id: number;
    billing_address_id: number;
    items: {
        product_id: number;
        quantity: number;
        unit_price: number;
    }[];
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
    notes?: string;
}

export interface OrderUpdate {
    status?: OrderStatus;
    notes?: string;
    shipping_address_id?: number;
    billing_address_id?: number;
}

export type OrderResponse = Order;
