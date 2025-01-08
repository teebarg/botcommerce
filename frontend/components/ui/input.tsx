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
                className={cn("group flex flex-col data-[hidden=true]:hidden w-full", classNames?.["base"])}
                data-filled={isFocused || Boolean(inputProps.value) || Boolean(props.placeholder)}
                data-filled-within={isFocused || Boolean(inputProps.value) || Boolean(props.placeholder)}
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
                        "relative w-full inline-flex shadow-sm px-3 data-[hover=true]:bg-content2 bg-content1",
                        "min-h-10 rounded-medium flex-col items-start justify-center gap-0 transition-background",
                        "!duration-150 outline-none",
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
                            "absolute z-10 pointer-events-none origin-top-left rtl:origin-top-right subpixel-antialiased block text-foreground-500 cursor-text",
                            "after:text-danger after:ml-0.5 rtl:after:ml-[unset] rtl:after:mr-0.5 will-change-auto !duration-200 !ease-out motion-reduce:transition-none",
                            "transition-[transform,color,left,opacity] group-data-[filled-within=true]:text-default-500 group-data-[filled-within=true]:pointer-events-auto",
                            "group-data-[filled-within=true]:scale-85 md:text-small text-xs group-data-[filled-within=true]:-translate-y-[calc(50%_+_theme(fontSize.small)/2_-_6px)] pe-2",
                            "max-w-full text-ellipsis overflow-hidden",
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
                                "w-full font-normal !outline-none placeholder:text-foreground-500 focus-visible:outline-none mt-auto",
                                "data-[has-start-content=true]:ps-1.5 data-[has-end-content=true]:pe-1.5 file:cursor-pointer file:bg-transparent file:border-0",
                                "autofill:bg-transparent bg-clip-text text-small group-data-[has-value=true]:text-default-foreground",
                                classNames?.["input"]
                            )}
                            data-filled={Boolean(inputProps.value)}
                            data-filled-within="true"
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
                        <div
                            {...descriptionProps}
                            className={cn("text-tiny text-foreground-500", classNames?.["description"])}
                            data-slot="description"
                        >
                            {props.description}
                        </div>
                    )}
                    {isInvalid && (
                        <div {...errorMessageProps} className="text-tiny text-danger" data-slot="error-message">
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
