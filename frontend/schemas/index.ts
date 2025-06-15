export * from "./enums";
export * from "./common";
export * from "./user";
export * from "./address";
export * from "./product";
export * from "./cart";
export * from "./order";
export * from "./pagination";
export * from "./review";

export interface DeliveryOption {
    id: number;
    name: string;
    description?: string;
    method: "STANDARD" | "EXPRESS" | "PICKUP";
    amount: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
