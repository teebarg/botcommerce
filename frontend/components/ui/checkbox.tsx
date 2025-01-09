import type { AriaCheckboxProps } from "@react-types/checkbox";

import React, { useRef } from "react";
import { useToggleState } from "@react-stately/toggle";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";
import { useCheckbox } from "@react-aria/checkbox";

import { cn } from "@/lib/util/cn";

interface CheckboxProps extends AriaCheckboxProps {
    label?: string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
}

const Checkbox: React.FC<CheckboxProps> = ({ label, color = "default", ...props }) => {
    const ref = useRef<HTMLInputElement>(null);
    const state = useToggleState(props);

    const cssClass = {
        default: "group-data-[selected=true]:bg-default group-data-[selected=true]:border-default group-hover:border-default",
        primary: "group-data-[selected=true]:bg-primary group-data-[selected=true]:border-primary group-hover:border-primary",
        secondary: "group-data-[selected=true]:bg-secondary group-data-[selected=true]:border-secondary group-hover:border-secondary",
        danger: "group-data-[selected=true]:bg-danger group-data-[selected=true]:border-danger group-hover:border-danger",
        warning: "group-data-[selected=true]:bg-warning group-data-[selected=true]:border-warning group-hover:border-warning",
        success: "group-data-[selected=true]:bg-success group-data-[selected=true]:border-success group-hover:border-success",
    };

    const { inputProps } = useCheckbox(props, state, ref);
    const isSelected = state.isSelected && !props.isIndeterminate;

    const { focusProps, isFocusVisible } = useFocusRing();

    return (
        <React.Fragment>
            <label data-selected={isSelected} className="flex items-center cursor-pointer group">
                <VisuallyHidden>
                    <input {...mergeProps(inputProps, focusProps)} ref={ref} />
                </VisuallyHidden>
                <div
                    aria-hidden="true"
                    className={cn(
                        "h-5 w-5 text-white rounded border-2 flex items-center justify-center transition-colors duration-200 mr-1 border-muted-foreground",
                        cssClass[color]
                    )}
                >
                    <svg className="stroke-current w-3 h-3" viewBox="0 0 18 18">
                        <polyline
                            fill="none"
                            points="1 9 7 14 15 4"
                            strokeDasharray={22}
                            strokeDashoffset={isSelected ? 44 : 66}
                            strokeWidth={3}
                            style={{
                                transition: "all 400ms",
                            }}
                        />
                    </svg>
                </div>
                {label && (
                    <span className={cn("text-sm font-medium leading-none select-none text-inherit", props.isDisabled && "opacity-50")}>{label}</span>
                )}
            </label>
        </React.Fragment>
    );
};

export { Checkbox };
