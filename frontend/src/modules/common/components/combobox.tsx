import { Item } from "@react-stately/collections";
import { useButton } from "@react-aria/button";
import { useComboBoxState } from "@react-stately/combobox";
import { useComboBox } from "@react-aria/combobox";
import { useFilter } from "@react-aria/i18n";
import React from "react";
import clsx from "clsx";
import { ChevronDownIcon } from "nui-react-icons";

interface ComboBoxItem {
    id: number;
    name: string;
}

interface ComboBoxProps {
    label: string;
    name: string;
    items: ComboBoxItem[];
    [key: string]: any;
    // children: React.ReactNode;
}

const ComboBox: React.FC<ComboBoxProps> = ({ name, ...props }) => {
    const { contains } = useFilter({ sensitivity: "base" });

    const state = useComboBoxState({
        defaultFilter: contains,
        // inputValue: "",
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

    return (
        <div className="combobox">
            <label className="combobox-label" {...labelProps}>
                {props.label}
            </label>
            <div className="relative inline-block">
                <button
                    {...buttonProps}
                    ref={triggerRef}
                    className={clsx(
                        "relative px-3 w-full inline-flex shadow-sm outline-none border-medium border-default-200",
                        "hover:border-default-400 transition-colors motion-reduce:transition-none",
                        "rounded-medium flex-col items-start justify-center gap-0 h-14 min-h-14 py-2",
                        {
                            "border-default-foreground": state.isOpen,
                        }
                    )}
                >
                    <input className="hidden" name={name} value={state.selectedKey} />
                    <input
                        {...inputProps}
                        ref={inputRef}
                        style={{
                            boxSizing: "border-box",
                        }}
                        className="combobox-input"
                    />
                    <ChevronDownIcon
                        className={clsx("absolute right-3 w-4 h-4 transition-transform duration-150 ease motion-reduce:transition-none", {
                            "rotate-180": state.isOpen,
                        })}
                    />
                </button>
                {state.isOpen && (
                    <div ref={popoverRef} className="combobox-popover z-50">
                        <ul {...listBoxProps} ref={listBoxRef} className="combobox-listbox">
                            {[...state.collection].map((item) => (
                                <li
                                    key={item.key}
                                    className={clsx("combobox-option", {
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
