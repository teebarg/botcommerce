import type { AriaNumberFieldProps } from "@react-aria/numberfield";

import { cn } from "@lib/util/cn";
import * as React from "react";
import { useState } from "react";
import { useNumberFieldState } from "react-stately";
import { useNumberField } from "@react-aria/numberfield";
import { useLocale } from "@react-aria/i18n";

type InputClassNames = Partial<Record<"base" | "inputWrapper" | "label" | "innerWrapper" | "description" | "input", string>>;

interface Props extends AriaNumberFieldProps {
    name?: string;
    size?: "sm" | "md" | "lg";
    hidden?: boolean;
    className?: string;
    classNames?: InputClassNames;
    errorMessage?: string;
}

const Number: React.FC<Props> = ({ name, errorMessage, hidden, size = "md", classNames, ...props }) => {
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
                className="group focus-visible:outline-none data-[hidden=true]:hidden w-full"
                data-filled="true"
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
                        "relative w-full inline-flex shadow-sm px-3 bg-content1 rounded-xl flex-col items-start justify-center outline-none",
                        {
                            "h-12 py-1.5": size === "sm",
                            "h-14 py-2": size === "md",
                            "h-16 py-2.5": size === "lg",
                        }
                    )}
                    data-hover={isHovered ? "true" : "false"}
                    data-slot="input-wrapper"
                    style={{ cursor: "text" }}
                >
                    <label
                        {...labelProps}
                        className={cn(
                            "absolute z-10 block text-default-900 duration-200 ease-out transition-all max-w-full text-ellipsis overflow-hidden",
                            "group-data-[filled=true]:text-default-500 group-data-[filled=true]:pointer-events-auto group-data-[filled=true]:scale-85",
                            "text-xs group-data-[filled=true]:-translate-y-[calc(50%_+_theme(fontSize.sm)/2_-_2px)] "
                        )}
                        data-slot="label"
                    >
                        {label}
                    </label>
                    <div
                        className="inline-flex w-full items-center h-full box-border group-data-[has-label=true]:items-end pb-0.5"
                        data-slot="inner-wrapper"
                    >
                        <input readOnly className="hidden" name={name} value={state.numberValue} />
                        <input
                            {...inputProps}
                            ref={inputRef}
                            className={cn(
                                "w-full font-normal bg-transparent placeholder:text-foreground-500 focus-visible:outline-none",
                                "text-sm group-data-[has-value=true]:text-default-foreground autofill:bg-transparent",
                                classNames?.["input"]
                            )}
                            data-filled={Boolean(inputProps.value)}
                            data-slot="input"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        />
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

Number.displayName = "Number";

export { Number };
