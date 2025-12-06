import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export interface SelectOption {
    value: string | number;
    label: string;
}

interface MultiSelectProps {
    options?: SelectOption[];
    placeholder?: string;
    onChange?: (selectedItems: SelectOption[]) => void;
    value?: SelectOption[];
    name?: string;
    disabled?: boolean;
    error?: string;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
    ({ options = [], placeholder = "Select options...", onChange, value = [], name, disabled = false, error }, ref) => {
        const [isOpen, setIsOpen] = useState<boolean>(false);
        const [selectedItems, setSelectedItems] = useState<SelectOption[]>(value);
        const dropdownRef = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            // Update internal state when value prop changes
            setSelectedItems(value);
        }, [value]);

        useEffect(() => {
            // Handle clicks outside the dropdown to close it
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

        const toggleDropdown = (): void => {
            if (!disabled) {
                setIsOpen(!isOpen);
            }
        };

        const toggleItem = (option: SelectOption): void => {
            let newSelectedItems: SelectOption[];

            if (selectedItems.some((item) => item.value === option.value)) {
                newSelectedItems = selectedItems.filter((item) => item.value !== option.value);
            } else {
                newSelectedItems = [...selectedItems, option];
            }

            setSelectedItems(newSelectedItems);

            // Call onChange with the new array of selected items
            if (onChange) {
                onChange(newSelectedItems);
            }
        };

        const removeItem = (e: React.MouseEvent, option: SelectOption): void => {
            e.stopPropagation();
            toggleItem(option);
        };

        return (
            <div ref={dropdownRef} className="relative w-full">
                <div
                    ref={ref}
                    className={`flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border px-3 py-2 text-sm bg-background ${
                        disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"
                    } ${error ? "border-red-500" : "border-border"}`}
                    onClick={toggleDropdown}
                >
                    {selectedItems.length > 0 ? (
                        selectedItems.map((item: SelectOption, idx: number) => (
                            <div key={idx} className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-blue-800">
                                <span>{item.label}</span>
                                {!disabled && <X className="cursor-pointer hover:text-blue-500" size={14} onClick={(e) => removeItem(e, item)} />}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                    <input name={name} type="hidden" value={selectedItems.map((item) => item.value).join(",")} />
                    <div className="ml-auto">
                        <ChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} size={18} />
                    </div>
                </div>

                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

                {isOpen && !disabled && (
                    <div className="absolute z-40 mt-1 w-full rounded-md border min-h-40 max-h-60 overflow-auto border-border bg-background py-1 shadow-lg">
                        {options.length > 0 ? (
                            options.map((option) => {
                                const isSelected = selectedItems.some((item) => item.value === option.value);

                                return (
                                    <div
                                        key={option.value}
                                        className={`flex cursor-pointer items-center px-3 py-2 ${isSelected ? "" : ""}`}
                                        onClick={() => toggleItem(option)}
                                    >
                                        <div
                                            className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                                                isSelected ? "border-blue-500 bg-blue-500" : "border-border"
                                            }`}
                                        />
                                        {option.label}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-2 text-gray-500">No options available</div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

MultiSelect.displayName = "MultiSelect";

// Props interface for the react-hook-form wrapper component
interface MultiSelectWithHookFormProps {
    control: any; // You can use a more specific type from react-hook-form if needed
    name: string;
    rules?: Record<string, any>;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
}

export const MultiSelectWithHookForm = ({ control, name, rules, options, placeholder, disabled }: MultiSelectWithHookFormProps) => {
    const { Controller } = require("react-hook-form");

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState: { error } }: any) => (
                <MultiSelect {...field} disabled={disabled} error={error?.message} options={options} placeholder={placeholder} />
            )}
            rules={rules}
        />
    );
};

export default MultiSelect;
