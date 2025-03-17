import React, { useState, useEffect, useRef } from "react";

// Define option type
export interface Option {
    id: string | number;
    name: string;
}

// Define component props
interface MultiSelectComboboxProps {
    options: Option[];
    placeholder?: string;
    onChange?: (selectedOptions: Option[]) => void;
    name?: string;
    value?: Option[];
    isDisabled?: boolean;
}

const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
    options = [],
    placeholder = "Select options...",
    onChange = () => {},
    name,
    value = [],
    isDisabled = false,
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [selectedOptions, setSelectedOptions] = useState<Option[]>(value);
    const comboboxRef = useRef<HTMLDivElement>(null);

    // Filter options based on search
    const filteredOptions = options.filter((option) => option.name.toLowerCase().includes(search.toLowerCase()));

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Toggle option selection
    const toggleOption = (option: Option): void => {
        setSelectedOptions((prev) => {
            // Check if option is already selected
            const isSelected = prev.some((item) => item.id === option.id);

            if (isSelected) {
                // Remove option if already selected
                onChange(prev.filter((item) => item.id !== option.id));

                return prev.filter((item) => item.id !== option.id);
            } else {
                // Add option if not selected
                onChange([...prev, option]);

                return [...prev, option];
            }
        });
    };

    // Remove a selected option
    const removeOption = (option: Option, e: React.MouseEvent): void => {
        e.stopPropagation();
        setSelectedOptions((prev) => prev.filter((item) => item.id !== option.id));
    };

    return (
        <div ref={comboboxRef} className="relative w-full">
            {/* Hidden input for form integration */}
            <input name={name} readOnly={true} type="hidden" value={selectedOptions.map((opt) => opt.id).join(",")} />

            {/* Main combobox button */}
            <div
                className={`flex relative min-h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
            >
                {/* Selected options display */}
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map((option) => (
                            <span key={option.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm">
                                {option.name}
                                <button
                                    className="text-blue-500 hover:text-blue-700 font-bold"
                                    type="button"
                                    onClick={(e) => removeOption(option, e)}
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-default-500">{placeholder}</span>
                    )}

                    {/* Search input that appears when dropdown is open */}
                    {isOpen && (
                        <input
                            autoFocus
                            className="outline-none flex-1 min-w-[80px] bg-transparent"
                            placeholder="Search..."
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </div>

                {/* Dropdown indicator */}
                <div className="ml-auto self-center">
                    <svg
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        height="16"
                        viewBox="0 0 16 16"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                </div>
            </div>
            {/* Dropdown options */}
            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option: Option, idx: number) => {
                            const isSelected = selectedOptions.some((item) => item.id === option.id);

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex cursor-pointer select-none items-center px-3 py-2 ${
                                        isSelected ? "text-blue-700" : "text-default-900"
                                    } hover:bg-content1`}
                                    onClick={() => toggleOption(option)}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            checked={isSelected}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            type="checkbox"
                                            onChange={() => {}}
                                        />
                                        {option.name}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="relative cursor-default select-none items-center px-3 py-2 text-default-500">No options found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectCombobox;
