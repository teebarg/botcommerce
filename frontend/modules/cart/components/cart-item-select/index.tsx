"use client";

import { SelectHTMLAttributes, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ChevronDown } from "nui-react-icons";
import { cn } from "@lib/util/cn";

type NativeSelectProps = {
    placeholder?: string;
    errors?: Record<string, unknown>;
    touched?: Record<string, unknown>;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">;

const CartItemSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(({ placeholder = "Select...", className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null);
    const [isPlaceholder, setIsPlaceholder] = useState(false);

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(ref, () => innerRef.current);

    useEffect(() => {
        if (innerRef.current && innerRef.current.value === "") {
            setIsPlaceholder(true);
        } else {
            setIsPlaceholder(false);
        }
    }, [innerRef.current?.value]);

    return (
        <div>
            <span
                className={cn(
                    "bg-default-100 [&_svg]:text-default-500 border-default-500 justify-center overflow-hidden rounded-md relative flex items-center border text-default-900 group",
                    className,
                    {
                        "text-default-500": isPlaceholder,
                    }
                )}
                onBlur={() => innerRef.current?.blur()}
                onFocus={() => innerRef.current?.focus()}
            >
                <select
                    ref={innerRef}
                    {...props}
                    className="appearance-none bg-transparent border-none px-4 transition-colors duration-150 focus:border-gray-700 outline-none w-16 h-16 items-center justify-center"
                >
                    <option disabled value="">
                        {placeholder}
                    </option>
                    {children}
                </select>
                <span className="absolute flex pointer-events-none justify-end w-8 group-hover:animate-pulse">
                    <ChevronDown />
                </span>
            </span>
        </div>
    );
});

CartItemSelect.displayName = "CartItemSelect";

export default CartItemSelect;
