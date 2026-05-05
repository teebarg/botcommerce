import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            outline: "text-foreground",
            accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
            "accent-subtle": "border-transparent bg-accent-subtle text-accent-subtle-foreground hover:bg-accent-subtle/90",
            success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
            "success-subtle": "border-transparent bg-success-subtle text-success-subtle-foreground hover:bg-success-subtle/90",
            warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
            "warning-subtle": "border-transparent bg-warning-subtle text-warning-subtle-foreground hover:bg-warning-subtle/90",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
