import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
            warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-danger text-danger-foreground hover:bg-danger/80",
            outline: "text-foreground",
            emerald: "border-transparent bg-emerald-100 text-emerald-900 border-emerald-200 hover:bg-emerald-200",
            blue: "border-transparent bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
            yellow: "border-transparent bg-yellow-200 text-yellow-900 border-yellow-200",
            gray: "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-200",
            primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
