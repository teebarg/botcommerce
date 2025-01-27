import type { AriaTextFieldProps } from "@react-types/textfield";

import { cn } from "@lib/util/cn";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTextField } from "@react-aria/textfield";

type InputClassNames = Partial<Record<"base" | "inputWrapper" | "label" | "innerWrapper" | "description" | "input", string>>;

interface Props extends AriaTextFieldProps {
    hidden?: boolean;
    className?: string;
    errorMessage?: string;
    classNames?: InputClassNames;
}

const TextArea: React.FC<Props> = ({ errorMessage, hidden, className, classNames, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);

    let { label } = props;
    let textareaRef = React.useRef<HTMLTextAreaElement>(null);

    let { labelProps, inputProps, descriptionProps, errorMessageProps, isInvalid, validationErrors } = useTextField(
        {
            ...props,
            inputElementType: "textarea",
        },
        textareaRef
    );

    const adjustHeight = () => {
        if (textareaRef.current) {
            // Reset height to auto to calculate the scroll height properly
            textareaRef.current.style.height = "auto";
            // Set height to scrollHeight but limit it to a max of 160px
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    };

    useEffect(() => {
        // Adjust height on mount
        adjustHeight();
    }, []);

    return (
        <React.Fragment>
            <div
                className={cn("group flex flex-col data-[hidden=true]:hidden w-full focus-visible:outline-none", className, classNames?.["base"])}
                data-filled="true"
                data-filled-within="true"
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
                    className={cn("relative w-full inline-flex shadow-sm px-3 bg-content1 rounded-xl flex-col py-2", classNames?.["inputWrapper"])}
                    data-hover={isHovered ? "true" : "false"}
                    data-slot="input-wrapper"
                    style={{ cursor: "text" }}
                >
                    <label
                        {...labelProps}
                        className={cn(
                            "z-10 pointer-events-none block text-foreground-500 cursor-text relative text-sm pb-0.5 max-w-full",
                            "duration-200 transition-all group-data-[filled-within=true]:text-default-500 text-ellipsis overflow-hidden",
                            classNames?.["label"]
                        )}
                        data-slot="label"
                    >
                        {label}
                    </label>
                    <div
                        className={cn("inline-flex w-full items-center h-full box-border group-data-[has-label=true]:items-end pb-0.5")}
                        data-slot="inner-wrapper"
                    >
                        <textarea
                            {...inputProps}
                            ref={textareaRef}
                            className={cn(
                                "w-full font-normal bg-transparent outline-none placeholder:text-foreground-500 focus-visible:outline-none text-sm",
                                "group-data-[has-value=true]:text-default-foreground pt-0 transition-height duration-100 resize-none autofill:bg-transparent",
                                classNames?.["input"]
                            )}
                            data-hide-scroll="true"
                            data-slot="input"
                            style={{ height: "60px !important" }}
                            onInput={adjustHeight}
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

TextArea.displayName = "TextArea";

export { TextArea };
