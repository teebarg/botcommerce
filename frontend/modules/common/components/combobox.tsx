import { Item } from "@react-stately/collections";
import { useComboBoxState } from "@react-stately/combobox";
import React from "react";
import { ChevronDown } from "nui-react-icons";
import { useButton } from "@react-aria/button";
import { useComboBox } from "@react-aria/combobox";
import { useFilter } from "@react-aria/i18n";
import { cn } from "@lib/util/cn";

interface ComboBoxItem {
    id: number | string;
    name: string;
}

interface ComboBoxProps {
    label?: string;
    name: string;
    defaultInputValue?: string;
    placeholder?: string;
    className?: string;
    items: ComboBoxItem[];
    [key: string]: any;
}

const ComboBox: React.FC<ComboBoxProps> = ({ name, label, placeholder, className, ...props }) => {
    const { contains } = useFilter({ sensitivity: "base" });

    const state = useComboBoxState({
        defaultFilter: contains,
        children: (item: ComboBoxItem) => <Item key={item.id}>{item.name}</Item>,
        ...props,
    });

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listBoxRef = React.useRef<HTMLUListElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    // Get props for child elements from useComboBox
    const {
        buttonProps: triggerProps,
        inputProps,
        listBoxProps,
        labelProps,
    } = useComboBox(
        {
            ...props,
            inputRef,
            buttonRef: triggerRef,
            listBoxRef,
            popoverRef,
            menuTrigger: "input",
        },
        state
    );

    const { buttonProps } = useButton(triggerProps, triggerRef);
    const { autoFocus, linkBehavior, shouldFocusOnHover, shouldSelectOnPressUp, shouldUseVirtualFocus, ...validListBoxProps } = listBoxProps;

    return (
        <div className={cn("inline-flex flex-col", className)}>
            {label && (
                <label className="text-foreground-500 text-xs" {...labelProps}>
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    {...buttonProps}
                    ref={triggerRef}
                    className={cn(
                        "relative px-3 w-full inline-flex shadow-sm outline-none bg-default-100",
                        "rounded-medium flex-col items-start justify-center h-12 py-2"
                    )}
                >
                    <input readOnly className="hidden" name={name} value={state.inputValue} />
                    <input
                        {...inputProps}
                        ref={inputRef}
                        className="bg-transparent outline-none flex-grow text-default-foreground font-normal text-small w-full cursor-pointer"
                        placeholder={placeholder}
                        style={{
                            boxSizing: "border-box",
                        }}
                    />
                    <ChevronDown
                        className={cn("absolute right-3 w-5 h-5 transition-transform duration-500 ease-out", {
                            "rotate-180": state.isOpen,
                        })}
                        viewBox="0 0 24 24"
                    />
                </button>
                {state.isOpen && (
                    <div ref={popoverRef} className="absolute w-full mt-1 left-0 top-full z-50">
                        <ul
                            {...validListBoxProps}
                            ref={listBoxRef}
                            className="absolute w-full bg-default-100 shadow-lg rounded-md max-h-52 overflow-y-auto px-1 py-2 list-none m-0"
                        >
                            {[...state.collection].map((item) => (
                                <li
                                    key={item.key}
                                    className={cn("px-2 py-4 cursor-pointer rounded-lg text-small font-semibold hover:bg-default/20", {
                                        "bg-default/70": state.selectionManager.isSelected(item.key),
                                    })}
                                    onMouseDown={() => state.selectionManager.select(item.key)}
                                >
                                    {item.rendered}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export { ComboBox };
