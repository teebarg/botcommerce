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
        <div className={cn("combobox", className)}>
            {label && (
                <label className="combobox-label" {...labelProps}>
                    {label}
                </label>
            )}
            <div className="relative inline-block">
                <button
                    {...buttonProps}
                    ref={triggerRef}
                    className={cn(
                        "relative px-3 w-full inline-flex shadow-sm outline-none border-medium border-default-100 bg-content1",
                        "hover:border-default-500 transition-colors motion-reduce:transition-none",
                        "rounded-medium flex-col items-start justify-center gap-0 h-10 min-h-10 py-2",
                        {
                            "border-default-foreground": state.isOpen,
                        }
                    )}
                >
                    <input readOnly className="hidden" name={name} value={state.inputValue} />
                    <input
                        {...inputProps}
                        ref={inputRef}
                        className="combobox-input"
                        placeholder={placeholder}
                        style={{
                            boxSizing: "border-box",
                        }}
                    />
                    <ChevronDown
                        className={cn("absolute right-3 w-4 h-4 transition-transform duration-150 ease motion-reduce:transition-none", {
                            "rotate-180": state.isOpen,
                        })}
                    />
                </button>
                {state.isOpen && (
                    <div ref={popoverRef} className="combobox-popover z-50">
                        <ul {...validListBoxProps} ref={listBoxRef} className="combobox-listbox">
                            {[...state.collection].map((item) => (
                                <li
                                    key={item.key}
                                    className={cn("combobox-option", {
                                        "bg-content3": state.selectionManager.isSelected(item.key),
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
