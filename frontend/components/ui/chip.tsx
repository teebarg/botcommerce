import React from "react";

import { cn } from "@/lib/util/cn";

// Define types for the props
type Color = "primary" | "secondary" | "default" | "danger" | "warning" | "success";
type Variant = "solid" | "bordered" | "shadow";
type Size = "sm" | "md" | "lg";

interface Props {
    title: React.ReactNode | string;
    color?: Color;
    variant?: Variant;
    size?: Size;
    className?: string;
    onClick?: () => void;
}

// Define type for the size CSS object
type SizeCss = Record<Size, string>;

// Define type for the color CSS object
type ColorCss = Record<Color, string>;

// Define type for the variant CSS object
type VariantCss = {
    solid: string;
    bordered: (color: Color) => string;
    shadow: (color: Color) => string;
};

const Chip: React.FC<Props> = ({ title, onClick, className, color = "primary", variant = "solid", size = "sm" }) => {
    const sizeCss: SizeCss = {
        sm: "px-1 h-6 text-xs",
        md: "px-1 h-7 text-sm",
        lg: "px-2 h-8 text-base",
    };
    const colorCss: ColorCss = {
        default: "bg-default text-default-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        danger: "bg-danger text-danger-foreground",
        warning: "bg-warning text-warning-foreground",
        success: "bg-success text-success-foreground",
    };

    // Define variant CSS with type safety
    const variantCss: VariantCss = {
        solid: "shadow-none",
        bordered: (color: Color) => `border-medium bg-transparent border-${color} text-${color}`,
        shadow: (color: Color) => `shadow-lg shadow-${color}/40`,
    };

    // Helper function to get variant CSS based on variant and color
    const getVariantCss = (variant: Variant, color: Color): string => {
        if (variant === "bordered" || variant === "shadow") {
            return variantCss[variant](color);
        }

        return variantCss[variant];
    };

    return (
        <React.Fragment>
            <div
                className={cn(
                    "relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap rounded-full rou",
                    sizeCss[size],
                    colorCss[color],
                    getVariantCss(variant, color),
                    className
                )}
                onClick={onClick}
            >
                <span className="flex-1 text-inherit font-normal px-2">{title}</span>
            </div>
        </React.Fragment>
    );
};

export default Chip;
