import { PaymentMethod, PaymentStatus } from "@/schemas";

export interface Payment {
    id: number;
    order_id: number;
    amount: number;
    reference: string;
    status: PaymentStatus;
    payment_method: PaymentMethod;
}

export interface PaymentInitialize {
    authorization_url: string;
    reference: string;
    access_code: string;
}
