import { type ReactNode } from "react";

export interface ListboxOption {
    id: string;
    label?: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    [key: string]: any; // Allow additional custom properties
}

export interface CustomListboxProps {
    options: ListboxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    renderItem?: (props: ListboxItemProps) => ReactNode;
}

export interface ListboxItemProps {
    option: ListboxOption;
    isSelected: boolean;
    onSelect: () => void;
}

export interface ListboxContextType {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    selectedId?: string;
    onSelect: (value: string) => void;
}

export interface ListboxTriggerProps {
    children: ReactNode;
    className?: string;
}

export interface ListboxContentProps {
    children: ReactNode;
    className?: string;
}
