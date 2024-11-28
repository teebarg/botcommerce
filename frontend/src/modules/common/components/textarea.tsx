import type { AriaTextFieldProps } from "@react-types/textfield";

import React from "react";
import { useTextField } from "@react-aria/textfield";

interface TextAreaProps extends AriaTextFieldProps {}

const TextArea: React.FC<TextAreaProps> = (props) => {
    let { label, description, ...e } = props;
    let ref = React.useRef(null);
    let { labelProps, inputProps } = useTextField(
        {
            ...props,
            inputElementType: "textarea",
        },
        ref
    );

    return (
        <React.Fragment>
            <div
                className="group flex flex-col data-[hidden=true]:hidden w-full focus:!bg-red-500"
                data-has-helper={description ? "true" : "false"}
                data-slot="base"
            >
                <div
                    className="relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-500 group-data-[focus=true]:bg-default-100 min-h-10 rounded-medium flex-col items-start justify-center gap-0 !h-auto transition-background motion-reduce:transition-none !duration-150 outline-none group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background py-2  hover:!bg-white/50 focus:!bg-white/50"
                    data-slot="input-wrapper"
                    style={{ cursor: "text" }}
                >
                    <label
                        {...labelProps}
                        className="z-10 pointer-events-none subpixel-antialiased block text-foreground-500 cursor-text relative will-change-auto !duration-200 !ease-out motion-reduce:transition-none transition-[transform,color,left,opacity] group-data-[filled-within=true]:text-default-500 group-data-[filled-within=true]:pointer-events-auto group-data-[filled-within=true]:scale-85 pb-0.5 pe-2 max-w-full text-ellipsis overflow-hidden font-semibold text-lg"
                    >
                        {label}
                    </label>
                    <div
                        className="inline-flex w-full h-full box-border items-start group-data-[has-label=true]:items-start pb-0.5 focus:!bg-white/50"
                        data-slot="inner-wrapper"
                    >
                        <textarea
                            {...inputProps}
                            ref={ref}
                            className="w-full font-normal bg-transparent !outline-none placeholder:text-foreground-500 focus-visible:outline-none data-[has-start-content=true]:ps-1.5 data-[has-end-content=true]:pe-1.5 file:cursor-pointer file:bg-transparent file:border-0 autofill:bg-transparent bg-clip-text text-small resize-none data-[hide-scroll=true]:scrollbar-hide group-data-[has-value=true]:text-default-foreground pt-0 transition-height !duration-100 motion-reduce:transition-none focus:!bg-transparent !text-gray-600"
                            style={{ height: "60px !important" }}
                        />
                    </div>
                </div>
                <div className="hidden group-data-[has-helper=true]:flex p-1 relative flex-col gap-1.5" data-slot="helper-wrapper">
                    <div className="text-tiny text-black/30 font-medium" data-slot="description" id="react-aria3658076345-:rr:">
                        {description}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export { TextArea };
