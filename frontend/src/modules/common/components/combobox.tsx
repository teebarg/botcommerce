// import React, { useState } from "react";
// import { useComboBox, useFilter, useButton } from "react-aria";
// import { useComboBoxState } from "react-stately";
// import ChevronDown from "../icons/chevron-down";

// const ComboBox = (props: any) => {
//     const { label } = props;
//     const [inputValue, setInputValue] = useState("");

//     let items = [
//         { id: 1, name: "Aardvark" },
//         { id: 2, name: "Cat" },
//         { id: 3, name: "Dog" },
//         { id: 4, name: "Kangaroo" },
//         { id: 5, name: "Koala" },
//         { id: 6, name: "Penguin" },
//         { id: 7, name: "Snake" },
//         { id: 8, name: "Turtle" },
//         { id: 9, name: "Zebra" },
//     ];

//     let { contains } = useFilter({ sensitivity: "base" });
//     let state = useComboBoxState({
//         ...props,
//         defaultFilter: contains,
//         items,
//         defaultInputValue: inputValue,
//         onInputChange: setInputValue,
//     });

//     let buttonRef = React.useRef(null);
//     let inputRef = React.useRef(null);
//     let listBoxRef = React.useRef(null);
//     let popoverRef = React.useRef(null);

//     let {
//         buttonProps: triggerProps,
//         inputProps,
//         listBoxProps,
//         labelProps,
//     } = useComboBox(
//         {
//             ...props,
//             inputRef,
//             buttonRef,
//             listBoxRef,
//             popoverRef,
//         },
//         state
//     );

//     let { buttonProps } = useButton(triggerProps, buttonRef);

//     return (
//         <div className="relative w-full max-w-xs">
//             <label {...labelProps} className="block text-sm font-medium text-gray-700 mb-1">
//                 {label}
//             </label>
//             <div
//                 className={`relative inline-flex flex-row overflow-hidden rounded-lg shadow-sm border border-gray-300 ${
//                     state.isFocused ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50" : ""
//                 }`}
//             >
//                 <input {...inputProps} ref={inputRef} className="outline-none px-3 py-2 w-full text-base" />
//                 <button {...buttonProps} ref={buttonRef} className="px-3 bg-gray-100 border-l border-gray-300 flex items-center">
//                     <ChevronDown size={18} />
//                 </button>
//             </div>
//             {state.isOpen && (
//                 <ul
//                     {...(listBoxProps as React.HTMLAttributes<HTMLUListElement>)}
//                     ref={listBoxRef}
//                     className="absolute z-20 w-full bg-red-500 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
//                 >
//                     {Array.from(state.collection).map((item) => (
//                         <li
//                             key={item.key}
//                             {...item.props}
//                             className={`cursor-default select-none relative py-2 pl-3 pr-9 ${
//                                 state.selectionManager.isSelected(item.key) ? "bg-blue-100 text-blue-900" : "text-gray-900"
//                             }`}
//                         >
//                             {item.rendered}
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

// import React, { useState, useRef } from "react";
// import { useComboBox, useFilter, useButton } from "react-aria";
// import { ListBox, Popover } from "react-aria-components";
// import { useComboBoxState } from "react-stately";
// // import ChevronDown from "../icons/chevron-down";

// interface Item {
//     id: string | number;
//     name: string;
// }

// interface CustomComboboxProps {
//     label: string;
//     items: Item[];
// }

// const ComboBox: React.FC<CustomComboboxProps> = (props) => {
//     const { label, items } = props;
//     const [inputValue, setInputValue] = useState("");

//     const { contains } = useFilter({ sensitivity: "base" });
//     const state = useComboBoxState({
//         ...props,
//         defaultFilter: contains,
//         items,
//         defaultInputValue: inputValue,
//         onInputChange: setInputValue,
//     });

//     console.log(state);

//     const buttonRef = useRef<HTMLButtonElement>(null);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const listBoxRef = useRef<HTMLUListElement>(null);
//     const popoverRef = useRef<HTMLDivElement>(null);

//     const {
//         buttonProps: triggerProps,
//         inputProps,
//         listBoxProps,
//         labelProps,
//     } = useComboBox(
//         {
//             ...props,
//             inputRef,
//             buttonRef,
//             listBoxRef,
//             popoverRef,
//         },
//         state
//     );

//     const { buttonProps } = useButton(triggerProps, buttonRef);

//     return (
//         <div className="relative w-full max-w-xs">
//             <label {...labelProps} className="block text-sm font-medium text-gray-700 mb-1">
//                 {label}
//             </label>
//             <div
//                 className={`relative inline-flex flex-row overflow-hidden rounded-lg shadow-sm border border-gray-300 ${
//                     state.isFocused ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50" : ""
//                 }`}
//             >
//                 <input {...inputProps} ref={inputRef} className="outline-none px-3 py-2 w-full text-base" />
//                 <button {...buttonProps} ref={buttonRef} className="px-3 bg-gray-100 border-l border-gray-300 flex items-center">
//                     {/* <ChevronDown size={18} /> */}
//                     <span className="text-sm font-medium">{label}</span>
//                 </button>
//             </div>
//             {(
//                 <ul
//                     {...(listBoxProps as React.HTMLAttributes<HTMLUListElement>)}
//                     ref={listBoxRef}
//                     className="absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
//                 >
//                     {Array.from(state.collection).map((item) => (
//                         <li
//                             key={item.key}
//                             role="option"
//                             aria-selected={state.selectionManager.isSelected(item.key)}
//                             className={`cursor-default select-none relative py-2 pl-3 pr-9 ${
//                                 state.selectionManager.isSelected(item.key) ? "bg-blue-100 text-blue-900" : "text-gray-900"
//                             }`}
//                         >
//                             {item.rendered}
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

// export { ComboBox };

import React, { useRef } from "react";
import { useComboBox, useButton, useFilter } from "react-aria";
import { useComboBoxState, Item } from "react-stately";
import { filterDOMProps } from "@react-aria/utils";

import { Item } from "@react-stately/collections";
import { mergeProps } from "@react-aria/utils";
// import { useButton } from "@react-aria/button";
import { useComboBoxState } from "@react-stately/combobox";
import { useComboBox } from "@react-aria/combobox";
import { useFilter } from "@react-aria/i18n";
import { useListBox, useOption } from "@react-aria/listbox";
import { useOverlay, DismissButton } from "@react-aria/overlays";

interface ComboBoxItem {
    id: number;
    name: string;
}

interface ComboBoxProps {
    label: string;
    items: ComboBoxItem[];
    name: string;
}

const ComboBox: React.FC<ComboBoxProps> = ({ label, items, name }) => {
    const { contains } = useFilter({ sensitivity: "base" });
    const state = useComboBoxState({
        defaultFilter: contains,
        items,
        inputValue: "",
        children: (item: ComboBoxItem) => <Item>{item.name}</Item>,
    });

    // Refs for the button, input, listbox, and popover elements
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listBoxRef = useRef<HTMLUListElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Get the props for comboBox
    const { buttonProps, inputProps, listBoxProps, labelProps } = useComboBox(
        {
            inputRef,
            buttonRef,
            listBoxRef,
            popoverRef,
        },
        state
    );

    return (
        <div style={{ display: "inline-flex", flexDirection: "column", gap: "8px" }}>
            <label {...labelProps} style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
                {label}
            </label>
            <div style={{ position: "relative", display: "flex" }}>
                <input
                    name={name}
                    {...inputProps}
                    ref={inputRef}
                    style={{
                        width: "200px",
                        padding: "8px 40px 8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        fontSize: "16px",
                    }}
                />
                <button
                    {...buttonProps}
                    ref={buttonRef}
                    style={{
                        position: "absolute",
                        right: "8px",
                        top: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                    }}
                >
                    ▼
                </button>
                {state.isOpen && (
                    <div
                        ref={popoverRef}
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: "0",
                            zIndex: 1,
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            marginTop: "4px",
                        }}
                    >
                        <ul {...filterDOMProps(listBoxProps)} ref={listBoxRef} style={{ margin: 0, padding: "8px 0", listStyle: "none" }}>
                            {[...state.collection].map((item) => (
                                <li
                                    key={item.key}
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                        backgroundColor: state.selectionManager.isSelected(item.key) ? "#e6f7ff" : "white",
                                    }}
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
