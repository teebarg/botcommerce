import { ChevronUpDown } from "nui-react-icons";
import { SelectHTMLAttributes, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@lib/util/cn";

export type NativeSelectProps = {
    placeholder?: string;
    errors?: Record<string, unknown>;
    touched?: Record<string, unknown>;
} & SelectHTMLAttributes<HTMLSelectElement>;

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
    ({ placeholder = "Select...", defaultValue, className, children, ...props }, ref) => {
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
                <div
                    className={cn("relative flex items-center text-base border border-default-900 bg-default-500 rounded-md", className, {
                        "text-default-500": isPlaceholder,
                    })}
                    onBlur={() => innerRef.current?.blur()}
                    onFocus={() => innerRef.current?.focus()}
                >
                    <select
                        ref={innerRef}
                        defaultValue={defaultValue}
                        {...props}
                        className="appearance-none flex-1 bg-transparent border-none px-4 py-2.5 transition-colors duration-150 outline-none "
                    >
                        <option disabled value="">
                            {placeholder}
                        </option>
                        {children}
                    </select>
                    <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none ">
                        <ChevronUpDown />
                    </span>
                </div>
            </div>
        );
    }
);

NativeSelect.displayName = "NativeSelect";

export default NativeSelect;
