import { cn } from "@lib/util/cn";
import * as React from "react";
import { useState } from "react";
import type { AriaNumberFieldProps } from "react-aria";
import { useNumberFieldState } from "react-stately";
import { useLocale, useNumberField } from "react-aria";

interface Props extends AriaNumberFieldProps {
    name?: string;
    size?: "sm" | "md" | "lg";
    hidden?: boolean;
    className?: string;
    errorMessage?: string;
}

const Number: React.FC<Props> = ({ name, errorMessage, hidden, size = "md", ...props }) => {
    const [isHovered, setIsHovered] = useState(false);
    let { label } = props;

    let { locale } = useLocale();
    let state = useNumberFieldState({ ...props, locale });
    let inputRef = React.useRef(null);
    let { labelProps, groupProps, inputProps, descriptionProps, errorMessageProps, isInvalid, validationErrors, ...ppp } = useNumberField(
        props,
        state,
        inputRef
    );

    return (
        <React.Fragment>
            <div
                className="group flex flex-col data-[hidden=true]:hidden w-full"
                data-slot="base"
                data-filled="true"
                data-filled-within="true"
                data-has-elements="true"
                data-has-label={Boolean(label)}
                data-has-value={Boolean(inputProps.value)}
                data-invalid={isInvalid}
                data-has-helper={isInvalid || props.description}
                data-hidden={hidden}
                data-hover={isHovered ? "true" : "false"}
            >
                <div
                    data-slot="input-wrapper"
                    className={cn(
                        "relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-200",
                        "group-data-[focus=true]:bg-default-100 min-h-10 rounded-medium flex-col items-start justify-center gap-0 transition-background motion-reduce:transition-none",
                        "!duration-150 outline-none group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus",
                        "group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background",
                        {
                            "h-12 py-1.5": size === "sm",
                            "h-14 py-2": size === "md",
                            "h-16 py-2.5": size === "lg",
                        }
                    )}
                    style={{ cursor: "text" }}
                    data-hover={isHovered ? "true" : "false"}
                >
                    <label
                        {...labelProps}
                        data-slot="label"
                        className={cn(
                            "absolute z-10 pointer-events-none origin-top-left rtl:origin-top-right subpixel-antialiased block text-foreground-500 cursor-text",
                            "will-change-auto !duration-200 !ease-out motion-reduce:transition-none transition-[transform,color,left,opacity]",
                            "group-data-[filled-within=true]:text-default-600 group-data-[filled-within=true]:pointer-events-auto group-data-[filled-within=true]:scale-85",
                            "text-small group-data-[filled-within=true]:-translate-y-[calc(50%_+_theme(fontSize.small)/2_-_6px)] pe-2 max-w-full text-ellipsis overflow-hidden"
                        )}
                    >
                        {label}
                    </label>
                    <div
                        data-slot="inner-wrapper"
                        className="inline-flex w-full items-center h-full box-border group-data-[has-label=true]:items-end pb-0.5"
                    >
                        <input readOnly className="hidden" name={name} value={state.numberValue} />
                        <input
                            {...inputProps}
                            ref={inputRef}
                            data-slot="input"
                            data-filled={Boolean(inputProps.value)}
                            data-filled-within="true"
                            className={cn(
                                "w-full font-normal bg-transparent !outline-none placeholder:text-foreground-500 focus-visible:outline-none",
                                "data-[has-start-content=true]:ps-1.5 data-[has-end-content=true]:pe-1.5 file:cursor-pointer file:bg-transparent file:border-0",
                                "autofill:bg-transparent bg-clip-text text-small group-data-[has-value=true]:text-default-foreground"
                            )}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        />
                    </div>
                </div>
                <div data-slot="helper-wrapper" className="hidden group-data-[has-helper=true]:flex p-1 relative flex-col gap-1.5">
                    {props.description && (
                        <div {...descriptionProps} data-slot="description" className="text-tiny text-foreground-400">
                            {props.description}
                        </div>
                    )}
                    {isInvalid && (
                        <div {...errorMessageProps} data-slot="error-message" className="text-tiny text-danger">
                            {validationErrors.join(" ")}
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};
Number.displayName = "Number";

export { Number };
