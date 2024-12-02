"use client";

import type {
    CustomListboxProps,
    ListboxOption,
    ListboxContextType,
    ListboxContentProps,
    ListboxTriggerProps,
    ListboxItemProps,
} from "../../types/listbox";

import { forwardRef, ChangeEvent, useState, useCallback, useEffect, useRef, createContext, useContext } from "react";
import { Check, ChevronUpDown, SearchIcon } from "nui-react-icons";

import { Button } from "./button";

import { cn } from "@/lib/util/cn";

const ListboxContext = createContext<ListboxContextType | undefined>(undefined);

export function useListbox() {
    const context = useContext(ListboxContext);

    if (!context) {
        throw new Error("useListbox must be used within a ListboxProvider");
    }

    return context;
}

export function ListboxContent({ children, className }: ListboxContentProps) {
    const { isOpen, setIsOpen } = useListbox();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md animate-in fade-in-0 zoom-in-95 bg-content1",
                className
            )}
        >
            {children}
        </div>
    );
}

interface ListboxSearchProps {
    onSearch: (value: string) => void;
}

export function ListboxSearch({ onSearch }: ListboxSearchProps) {
    const [value, setValue] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        setValue(newValue);
        onSearch(newValue);
    };

    return (
        <div className="relative">
            <SearchIcon aria-hidden="true" className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
                aria-label="Search options"
                className="w-full border-0 border-b bg-transparent py-2 pl-8 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
                placeholder="Search..."
                role="searchbox"
                type="text"
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}

// eslint-disable-next-line react/display-name
export const ListboxTrigger = forwardRef<HTMLButtonElement, ListboxTriggerProps>(({ children, className }, ref) => {
    const { isOpen, setIsOpen } = useListbox();

    return (
        <Button
            ref={ref}
            aria-expanded={isOpen}
            className={cn("w-full justify-between hover:bg-accent/50 transition-colors py-6", className)}
            role="combobox"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
        >
            {children}
        </Button>
    );
});

export const DefaultListboxItem = forwardRef<HTMLButtonElement, ListboxItemProps>(({ option, isSelected, onSelect }, ref) => (
    <button
        ref={ref}
        aria-selected={isSelected}
        className={cn(
            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            isSelected && "bg-accent/50",
        )}
        role="option"
        onClick={onSelect}
    >
        {option.icon && <option.icon aria-hidden="true" className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />}
        <div className="flex flex-col">
            <span>{option.label}</span>
            {option.description && (
                <span aria-description={option.description} className="text-xs text-muted-foreground">
                    {option.description}
                </span>
            )}
        </div>
        {isSelected && <Check aria-hidden="true" className="ml-auto h-4 w-4 shrink-0" />}
    </button>
));

DefaultListboxItem.displayName = "DefaultListboxItem";

export function Listbox({ options, value, onChange, placeholder = "Select an option...", className, renderItem }: CustomListboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const selectedOption = options.find((option) => option.id === value);

    const filteredOptions = options.filter((option) => option?.firstname?.toLowerCase().includes(searchQuery?.toLowerCase()));

    const handleSelect = useCallback(
        (optionId: string) => {
            onChange(optionId);
            setIsOpen(false);
        },
        [onChange]
    );

    return (
        <ListboxContext.Provider
            value={{
                isOpen,
                setIsOpen,
                selectedId: value,
                onSelect: handleSelect,
            }}
        >
            <div className={cn("relative w-full", className)}>
                <ListboxTrigger>
                    {selectedOption ? (
                        <div className="flex items-center gap-2">
                            {selectedOption.icon && <selectedOption.icon className="h-4 w-4 shrink-0" />}
                            <span>{selectedOption.address_1}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronUpDown className="ml-2 shrink-0" />
                </ListboxTrigger>

                <ListboxContent className="w-full">
                    <ListboxSearch onSearch={setSearchQuery} />
                    <div aria-label="Options" className="max-h-[300px] overflow-auto p-1" id="listbox-options" role="listbox">
                        {filteredOptions.length === 0 ? (
                            <p className="p-2 text-sm text-muted-foreground text-center">No options found</p>
                        ) : (
                            filteredOptions.map((option: ListboxOption, index: number) => {
                                const itemProps = {
                                    option,
                                    isSelected: option.id === value,
                                    onSelect: () => handleSelect(option.id),
                                };

                                return <div key={option.id}>{renderItem ? renderItem(itemProps) : <DefaultListboxItem {...itemProps} />}</div>;
                            })
                        )}
                    </div>
                </ListboxContent>
            </div>
        </ListboxContext.Provider>
    );
}
