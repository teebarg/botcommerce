"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useFormStatus } from "react-dom";

export function FormButton({
    children,
    color = "default",
    variant = "solid",
    size = "sm",
    className,
    "data-testid": dataTestId,
}: {
    children: React.ReactNode;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    variant?: "solid" | "bordered" | "flat" | "shadow";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    className?: string;
    "data-testid"?: string;
}) {
    const { pending } = useFormStatus();

    return (
        <Button className={className} color={color} data-testid={dataTestId} isLoading={pending} size={size} type="submit" variant={variant}>
            {children}
        </Button>
    );
}
