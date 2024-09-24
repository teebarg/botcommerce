import React, { useRef } from "react";
import { useToggleState } from "@react-stately/toggle";
import clsx from "clsx";
import { useCheckbox } from "@react-aria/checkbox";
import { AriaCheckboxProps } from "react-aria";

interface CheckboxProps extends AriaCheckboxProps {
    label: string;
}

const Checkbox: React.FC<CheckboxProps> = (props) => {
    const ref = useRef<HTMLInputElement>(null);
    const state = useToggleState(props);

    const { inputProps } = useCheckbox(props, state, ref);

    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                <label
                    className={clsx(
                        "inline-flex items-center cursor-pointer select-none",
                        "py-1 px-2.5 rounded-3xl transition-colors duration-300 ease-in-out",
                        state.isSelected ? "bg-green-500" : "bg-gray-300"
                    )}
                >
                    <input {...inputProps} ref={ref} className="absolute opacity-0 w-0 h-0" />
                    <div
                        className={clsx(
                            "relative w-8 h-5 rounded-xl transition-bg-color duration-300 ease-in-out",
                            state.isSelected ? "bg-green-500" : "bg-gray-300"
                        )}
                    >
                        <div
                            className={clsx(
                                "w-4 h-4 bg-white rounded-[50%] absolute top-0.5 transition-[left] duration-300 ease-in-out",
                                state.isSelected ? "left-5" : "left-0"
                            )}
                        />
                    </div>
                </label>
                <span className="text-sm">{props.label}</span>
            </div>
        </React.Fragment>
    );
};

export { Checkbox };
