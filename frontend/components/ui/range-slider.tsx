import type { AriaSliderProps, AriaSliderThumbProps } from "@react-types/slider";

import React from "react";
import { useSliderState } from "react-stately";
import { mergeProps, useFocusRing, useNumberFormatter, useSlider, useSliderThumb, VisuallyHidden } from "react-aria";

import { cn } from "@/lib/util/cn";

interface SliderProps extends AriaSliderProps {
    label?: string;
    formatOptions?: Intl.NumberFormatOptions;
    defaultValue?: number[];
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
}

interface ThumbProps extends AriaSliderThumbProps {
    state: any;
    trackRef: React.RefObject<HTMLDivElement>;
    name?: string;
    cssClass?: string;
}

const RangeSlider: React.FC<SliderProps> = ({ color = "primary", ...props }) => {
    let trackRef = React.useRef(null);

    let numberFormatter = useNumberFormatter(props.formatOptions);
    let state = useSliderState({ ...props, numberFormatter });
    let { groupProps, trackProps, labelProps, outputProps } = useSlider(props, state, trackRef);

    const cssClass = {
        default: "bg-default",
        primary: "bg-primary",
        secondary: "bg-secondary",
        danger: "bg-danger",
        warning: "bg-warning",
        success: "bg-success",
    };

    return (
        <div {...groupProps} className="flex flex-col">
            {props.label && (
                <div className="flex justify-between text-sm">
                    <label {...labelProps}>{props.label}</label>
                    <output {...outputProps}>{`${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`}</output>
                </div>
            )}
            <div {...trackProps} ref={trackRef} className={cn("track h-8", state.isDisabled && "disabled opacity-40")}>
                <Thumb cssClass={cssClass[color]} index={0} state={state} trackRef={trackRef} />
                <Thumb cssClass={cssClass[color]} index={1} state={state} trackRef={trackRef} />
            </div>
        </div>
    );
};

const Thumb: React.FC<ThumbProps> = ({ cssClass, ...props }) => {
    let { state, trackRef, index, name } = props;
    let inputRef = React.useRef(null);
    let { thumbProps, inputProps, isDragging } = useSliderThumb(
        {
            index,
            trackRef,
            inputRef,
            name,
        },
        state
    );

    let { focusProps, isFocusVisible } = useFocusRing();

    return (
        <div {...thumbProps} className={cn("thumb top-1/2 rounded-50 w-5 h-5", cssClass, isFocusVisible && "focus", isDragging && "dragging")}>
            <VisuallyHidden>
                <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
            </VisuallyHidden>
        </div>
    );
};

export default RangeSlider;
