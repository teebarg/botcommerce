import { cn } from "@/lib/util/cn";
import { forwardRef } from "react";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    icon?: React.ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ className, label, description, icon, ...props }, ref) => {
    return (
        <label
            className={cn(
                "relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                props.checked ? "bg-primary text-primary-foreground" : "bg-popover hover:bg-accent hover:text-accent-foreground",
                className
            )}
        >
            <input type="radio" className="sr-only" ref={ref} {...props} />
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon && <div className="flex-shrink-0">{icon}</div>}
                    <div>
                        {label && <div className="font-medium">{label}</div>}
                        {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
                    </div>
                </div>
                <div
                    className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                        props.checked ? "border-primary-foreground" : "border-muted-foreground"
                    )}
                >
                    {props.checked && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                </div>
            </div>
        </label>
    );
});
