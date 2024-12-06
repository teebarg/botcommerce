import { ReactNode } from "react";

export interface RadioOption {
    id: string;
    label: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
}

export interface CustomRadioGroupProps {
    options: RadioOption[];
    value?: string;
    onChange: (value: string) => void;
    name: string;
    className?: string;
}

export interface RadioItemProps {
    option: RadioOption;
    isSelected: boolean;
    name: string;
    onSelect: () => void;
}

export interface RadioLabelProps {
    children: ReactNode;
    className?: string;
}

export interface RadioGroupProps {
    value?: string;
    onChange: (value: string) => void;
    name: string;
    children: ReactNode;
    className?: string;
}

export interface RadioOptionProps {
    value: string;
    children: ReactNode;
    className?: string;
}
