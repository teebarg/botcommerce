import { forwardRef } from "react";
import { Check } from "nui-react-icons";
import { cn } from "@/lib/util/cn";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, ...props }, ref) => {
    return (
        <label className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative">
                <input type="checkbox" className="sr-only" ref={ref} {...props} />
                <div
                    className={cn(
                        "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors duration-200",
                        props.checked ? "bg-primary border-primary" : "border-muted-foreground",
                        "group-hover:border-primary",
                        className
                    )}
                >
                    {props.checked && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
            </div>
            {label && <span className="text-sm font-medium leading-none group-hover:text-primary">{label}</span>}
        </label>
    );
});
