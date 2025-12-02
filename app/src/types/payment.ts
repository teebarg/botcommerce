export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export interface Payment {
    id: number;
    order_id: number;
    user_id: number;
    amount: number;
    reference: string;
    status: PaymentStatus;
    payment_method: string;
    metadata: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

export interface PaymentInitialize {
    authorization_url: string;
    reference: string;
    access_code: string;
}

export interface PaymentVerify {
    status: string;
    message: string;
    payment_id?: number;
}
