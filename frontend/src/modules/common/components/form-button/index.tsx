"use client";

import React from "react";
import { useFormStatus } from "react-dom";

import Button from "../button";

export function FormButton({
    children,
    color = "default",
    variant = "solid",
    size = "md",
    fullWidth = false,
    className,
    "data-testid": dataTestId,
}: {
    children: React.ReactNode;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success" | undefined;
    variant?: "solid" | "bordered" | "flat" | "shadow";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    className?: string;
    "data-testid"?: string;
}) {
    const { pending } = useFormStatus();

    return (
        <Button
            className={className}
            color={color}
            data-testid={dataTestId}
            // fullWidth={fullWidth}
            isLoading={pending}
            size={size}
            type="submit"
            variant={variant}
        >
            {children}
        </Button>
    );
}
