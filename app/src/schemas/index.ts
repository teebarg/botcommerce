export * from "./enums";
export * from "./common";
export * from "./address";
export * from "./user";
export * from "./product";
export * from "./cart";
export * from "./order";
export * from "./review";
export * from "./activity";
export * from "./chat";

export interface DeliveryOption {
    id: number;
    name: string;
    description?: string;
    method: "STANDARD" | "EXPRESS" | "PICKUP";
    amount: number;
    duration: string;
    is_active: boolean;
}

import { badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
