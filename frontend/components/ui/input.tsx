import type { AriaTextFieldProps } from "@react-types/textfield";

import { cn } from "@lib/util/cn";
import * as React from "react";
import { useState } from "react";
import { useTextField } from "@react-aria/textfield";

type InputClassNames = Partial<Record<"base" | "inputWrapper" | "label" | "innerWrapper" | "description" | "input", string>>;

interface Props extends AriaTextFieldProps {
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    size?: "sm" | "md" | "lg";
    hidden?: boolean;
    classNames?: InputClassNames;
    errorMessage?: string;
    onClear?: () => void;
}

const Input: React.FC<Props> = ({ errorMessage, hidden, size = "md", endContent, startContent, classNames, ...props }) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    let { label } = props;
    let ref = React.useRef(null);
    let { labelProps, inputProps, descriptionProps, errorMessageProps, isInvalid, validationErrors } = useTextField(props, ref);

    return (
        <React.Fragment>
            <div
                className={cn("group focus-visible:outline-none data-[hidden=true]:hidden w-full", classNames?.["base"])}
                data-filled={isFocused || Boolean(inputProps.value) || Boolean(props.placeholder)}
                data-focus={isFocused}
                data-focus-within={isFocused}
                data-has-elements="true"
                data-has-helper={isInvalid || props.description}
                data-has-label={Boolean(label)}
                data-has-value={Boolean(inputProps.value)}
                data-hidden={hidden}
                data-hover={isHovered ? "true" : "false"}
                data-invalid={isInvalid}
                data-slot="base"
            >
                <div
                    className={cn(
                        "relative w-full flex-col items-start justify-center inline-flex shadow-sm px-3 bg-default-100 rounded-xl outline-none",
                        {
                            "h-10 py-1.5": size === "sm",
                            "h-14 py-2": size === "md",
                            "h-16 py-2.5": size === "lg",
                        },
                        classNames?.["inputWrapper"]
                    )}
                    data-focus={isFocused}
                    data-hover={isHovered ? "true" : "false"}
                    data-slot="input-wrapper"
                    style={{ cursor: "text" }}
                >
                    <label
                        {...labelProps}
                        className={cn(
                            "absolute z-10 block text-foreground-500 cursor-text after:text-danger after:ml-0.5 duration-200 ease-out transition-all",
                            "group-data-[filled=true]:text-default-500 group-data-[filled=true]:pointer-events-auto max-w-full text-ellipsis overflow-hidden",
                            "group-data-[filled=true]:scale-85 text-xs group-data-[filled=true]:-translate-y-[calc(50%_+_theme(fontSize.sm)/2_-_2px)]",
                            {
                                "after:content-['*']": props.isRequired,
                            },
                            classNames?.["label"]
                        )}
                        data-slot="label"
                    >
                        {label}
                    </label>
                    <div
                        className={cn("inline-flex w-full items-center h-full box-border pb-0.5", classNames?.["innerWrapper"])}
                        data-slot="inner-wrapper"
                    >
                        {startContent}
                        <input
                            {...inputProps}
                            ref={ref}
                            className={cn(
                                "w-full bg-transparent font-normal placeholder:text-foreground-500 focus-visible:outline-none group-data-[has-label=true]:mt-auto autofill:bg-transparent data-[has-end-content=true]:pe",
                                "file:cursor-pointer file:bg-transparent file:border-0 text-sm group-data-[has-value=true]:text-default-foreground data-[has-start-content=true]:ps-1.5",
                                classNames?.["input"]
                            )}
                            data-filled={Boolean(inputProps.value)}
                            data-has-end-content={endContent ? "true" : "false"}
                            data-has-start-content={startContent ? "true" : "false"}
                            data-slot="input"
                            onBlur={() => setIsFocused(false)}
                            onFocus={() => setIsFocused(true)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        />
                        {endContent}
                    </div>
                </div>
                <div className="hidden group-data-[has-helper=true]:flex p-1 relative flex-col gap-1.5" data-slot="helper-wrapper">
                    {props.description && (
                        <div {...descriptionProps} className={cn("text-xs text-foreground-500", classNames?.["description"])} data-slot="description">
                            {props.description}
                        </div>
                    )}
                    {isInvalid && (
                        <div {...errorMessageProps} className="text-xs text-danger" data-slot="error-message">
                            {validationErrors.join(" ")}
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};

Input.displayName = "Input";

export { Input };
