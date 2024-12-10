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
}

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
    const ref = useRef<HTMLInputElement>(null);
    const state = useToggleState(props);

    const { inputProps } = useCheckbox(props, state, ref);
    const isSelected = state.isSelected && !props.isIndeterminate;

    const { focusProps, isFocusVisible } = useFocusRing();

    return (
        <React.Fragment>
            <label className="flex items-center cursor-pointer group">
                <VisuallyHidden>
                    <input {...mergeProps(inputProps, focusProps)} ref={ref} />
                </VisuallyHidden>
                <div
                    aria-hidden="true"
                    className={cn(
                        "h-5 w-5 text-white rounded border-2 flex items-center justify-center transition-colors duration-200 group-hover:border-primary mr-1",
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground"
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
