"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader } from "nui-react-icons";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input bg-background hover:bg-accent",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                warning: "bg-warning text-white hover:bg-warning/90",
                success: "bg-success text-white hover:bg-success/90",
                emerald: "bg-emerald-700 text-white hover:bg-emerald-800",
                bordered: "bg-transparent border-2 border-primary text-primary hover:bg-primary-500",
                indigo: "bg-indigo-500 text-white hover:bg-indigo-600",
                accent: "bg-accent text-accent-foreground transform hover:scale-105 font-semibold",
                contrast: "bg-contrast text-contrast-foreground",
            },
            size: {
                default: "h-10 px-4 py-2",
                xs: "h-7 rounded-md px-2",
                sm: "h-9 rounded-md px-3",
                md: "h-11 rounded-md px-8 text-base font-normal min-w-32",
                lg: "h-12 rounded-md px-8 text-base font-normal min-w-32",
                xl: "h-14 rounded-lg px-12 text-base",
                icon: "h-10 w-10",
                iconOnly: "h-auto w-auto bg-transparent hover:bg-transparent border-none",
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
        const [isClient, setIsClient] = React.useState<boolean>(false);

        React.useEffect(() => {
            setIsClient(true);
        }, []);

        if (!isClient) return null;

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
                        <Loader className="h-4 w-4 animate-spin" />
                        {size === "icon" || size === "iconOnly" ? "" : "Loading..."}
                    </>
                ) : (
                    <>
                        {startContent && <span>{startContent}</span>}
                        {children}
                        {endContent && <span>{endContent}</span>}
                    </>
                )}
            </Comp>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
