import React from "react";
import { useToggleState } from "@react-stately/toggle";
import clsx from "clsx";
import { AriaSwitchProps, useSwitch } from "@react-aria/switch";
import { useFocusRing } from "@react-aria/focus";

interface SwitchProps extends AriaSwitchProps {
    label?: string;
}

const Switch: React.FC<SwitchProps> = (props) => {
    let state = useToggleState(props);
    let ref = React.useRef<HTMLInputElement>(null);
    let { inputProps } = useSwitch(props, state, ref);
    let { isFocusVisible, focusProps } = useFocusRing();
    let isSelected = state.isSelected;

    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                <label
                    className={clsx(
                        "inline-flex items-center cursor-pointer select-none",
                        "py-1 px-2.5 rounded-3xl transition-colors duration-300 ease-in-out",
                        isSelected ? "bg-green-500" : "bg-gray-300"
                    )}
                    style={{
                        opacity: props.isDisabled ? 0.4 : 1,
                    }}
                >
                    <input {...inputProps} {...focusProps} ref={ref} className="absolute opacity-0 w-0 h-0" />
                    <div
                        className={clsx(
                            "relative w-8 h-5 rounded-xl transition-bg-color duration-300 ease-in-out",
                            isSelected ? "bg-green-500" : "bg-gray-300"
                        )}
                    >
                        <div
                            className={clsx(
                                "w-4 h-4 bg-white rounded-[50%] absolute top-0.5 transition-[left] duration-300 ease-in-out",
                                isSelected ? "left-5" : "left-0"
                            )}
                        />
                    </div>
                </label>
                <span className="text-sm">{props.label}</span>
            </div>
        </React.Fragment>
    );
};

export { Switch };