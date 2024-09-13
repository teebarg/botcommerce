import React, { cloneElement, isValidElement, useRef } from "react";
import { useButton } from "@react-aria/button";
import { VisuallyHidden } from "@react-aria/visually-hidden";

interface FileTriggerProps {
    onSelect: (files: FileList | null) => void;
    children: React.ReactNode;
    allowsMultiple?: boolean;
    acceptedFileTypes?: string[];
}

const FileTrigger: React.FC<FileTriggerProps> = ({ onSelect, acceptedFileTypes, allowsMultiple = false, children }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { buttonProps } = useButton(
        {
            onPress: () => {
                inputRef.current?.click();
            },
        },
        inputRef
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(event.target.files);
    };

    const child = isValidElement(children) ? cloneElement(children, buttonProps) : children;

    return (
        <React.Fragment>
            {child}
            <VisuallyHidden>
                <input ref={inputRef} type="file" onChange={handleChange} aria-hidden="true" multiple={allowsMultiple} accept={acceptedFileTypes?.join(',')} />
            </VisuallyHidden>
        </React.Fragment>
    );
};

export { FileTrigger };
