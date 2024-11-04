import type { AriaCheckboxProps } from "@react-types/checkbox";

import React, { useRef } from "react";
import { useToggleState } from "@react-stately/toggle";
import clsx from "clsx";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";
import { useCheckbox } from "@react-aria/checkbox";

interface CheckboxProps extends AriaCheckboxProps {}

const Checkbox: React.FC<CheckboxProps> = (props) => {
    const ref = useRef<HTMLInputElement>(null);
    const state = useToggleState(props);

    const { inputProps } = useCheckbox(props, state, ref);
    const isSelected = state.isSelected && !props.isIndeterminate;

    const { focusProps, isFocusVisible } = useFocusRing();

    const checkboxClassName = clsx(
        isSelected ? "bg-indigo-500 group-active:bg-indigo-600" : "bg-white",
        "text-white",
        "border-2",
        "rounded",
        props.isDisabled
            ? "border-gray-300"
            : isFocusVisible || isSelected
              ? "border-indigo-500 group-active:border-indigo-600"
              : "border-gray-500 group-active:border-gray-600",
        "w-5",
        "h-5",
        "flex",
        "flex-shrink-0",
        "justify-center",
        "items-center",
        "mr-2",
        isFocusVisible ? "shadow-outline" : "",
        "transition",
        "ease-in-out",
        "duration-150"
    );

    const labelClassName = clsx(props.isDisabled ? "text-gray-400" : "text-gray-700 group-active:text-gray-800", "select-none");

    return (
        <React.Fragment>
            <label className="flex items-center group">
                <VisuallyHidden>
                    <input {...mergeProps(inputProps, focusProps)} ref={ref} />
                </VisuallyHidden>
                <div aria-hidden="true" className={checkboxClassName}>
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
                <span className={labelClassName}>{props.children}</span>
            </label>
        </React.Fragment>
    );
};

export { Checkbox };
