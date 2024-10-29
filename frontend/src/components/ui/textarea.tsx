import { cn } from "@lib/util/cn";
import * as React from "react";
import { useEffect, useState } from "react";
import type { AriaTextFieldProps } from "react-aria";
import { useTextField } from "react-aria";

interface Props extends AriaTextFieldProps {
    hidden?: boolean;
    className?: string;
    errorMessage?: string;
}

const TextArea: React.FC<Props> = ({ errorMessage, hidden, className, ...props }) => {
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
                className={cn("group flex flex-col data-[hidden=true]:hidden w-full", className)}
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
                        "relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100",
                        "min-h-10 rounded-medium flex-col items-start justify-center gap-0 !h-auto transition-background motion-reduce:transition-none !duration-150 outline-none",
                        "group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2",
                        "group-data-[focus-visible=true]:ring-offset-background py-2"
                    )}
                    style={{ cursor: "text" }}
                    data-hover={isHovered ? "true" : "false"}
                >
                    <label
                        {...labelProps}
                        data-slot="label"
                        className={cn(
                            "z-10 pointer-events-none origin-top-left rtl:origin-top-right subpixel-antialiased block text-foreground-500 cursor-text relative will-change-auto",
                            "!duration-200 !ease-out motion-reduce:transition-none transition-[transform,color,left,opacity] group-data-[filled-within=true]:text-default-600",
                            "group-data-[filled-within=true]:pointer-events-auto group-data-[filled-within=true]:scale-85 text-small pb-0.5 pe-2 max-w-full text-ellipsis overflow-hidden"
                        )}
                    >
                        {label}
                    </label>
                    <div
                        data-slot="inner-wrapper"
                        className="inline-flex w-full items-center h-full box-border group-data-[has-label=true]:items-end pb-0.5"
                    >
                        <textarea
                            {...inputProps}
                            ref={textareaRef}
                            data-slot="input"
                            className={cn(
                                "w-full font-normal bg-transparent !outline-none placeholder:text-foreground-500 focus-visible:outline-none data-[has-start-content=true]:ps-1.5",
                                "data-[has-end-content=true]:pe-1.5 file:cursor-pointer file:bg-transparent file:border-0 autofill:bg-transparent bg-clip-text text-small resize-none",
                                "data-[hide-scroll=true]:scrollbar-hide group-data-[has-value=true]:text-default-foreground pt-0 transition-height !duration-100 motion-reduce:transition-none"
                            )}
                            data-hide-scroll="true"
                            // style={{ height }}
                            onInput={adjustHeight}
                            style={{ height: "60px !important" }}
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
TextArea.displayName = "TextArea";

export { TextArea };
