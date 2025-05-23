"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader } from "nui-react-icons";

import { cn } from "@/lib/util/cn";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-danger text-danger-foreground hover:bg-danger/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                primary: "bg-primary text-primary-foreground hover:bg-primary/90",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                warning: "bg-warning text-white hover:bg-warning/90",
                success: "bg-success text-white hover:bg-success/90",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8 w-full text-base font-normal",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, children, startContent, endContent, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                ref={ref}
                className={cn(
                    "relative flex items-center justify-center",
                    isLoading && "opacity-50 cursor-not-allowed",
                    buttonVariants({ variant, size, className })
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                    </>
                ) : (
                    <>
                        {startContent && <span className="mr-2">{startContent}</span>}
                        {children}
                        {endContent && <span className="ml-2">{endContent}</span>}
                    </>
                )}
            </Comp>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
