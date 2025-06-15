export * from "./enums";
export * from "./common";
export * from "./address";
export * from "./user";
export * from "./product";
export * from "./cart";
export * from "./order";
export * from "./review";
export * from "./activity";
export * from "./conversation";

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
