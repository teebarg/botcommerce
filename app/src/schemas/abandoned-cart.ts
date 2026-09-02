export interface UserMini {
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
}

export interface CartItemVariant {
    id: number;
    sku: string;
    price: number;
    compare_at_price: number | null;
    options: Record<string, string> | null;
}

export interface CartItem {
    id: number;
    variant_id: number;
    name: string | null;
    slug: string | null;
    image: string | null;
    quantity: number;
    variant: CartItemVariant | null;
}

export interface AbandonedCart {
    id: number;
    cart_number: string;
    user_id: number | null;
    user: UserMini | null;
    guest_id: string | null;
    status: string;
    email: string | null;
    phone: string | null;
    subtotal: number;
    shipping_fee: number;
    discount_amount: number;
    total: number;
    coupon_code: string | null;
    items: CartItem[];
    created_at: string;
    updated_at: string | null;
}

export interface AbandonedCartListResponse {
    items: AbandonedCart[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
}

export interface AbandonedCartListParams {
    skip?: number;
    limit?: number;
    search?: string;
}
