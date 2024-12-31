import type { CustomRadioGroupProps, RadioItemProps, RadioGroupProps, RadioOptionProps } from "../../types/radio";

import React from "react";

import { cn } from "@/lib/util/cn";

export function CustomRadioGroup({ options, value, onChange, name, className }: CustomRadioGroupProps) {
    return (
        <div className={cn("grid gap-4", className)} role="radiogroup">
            {options.map((option) => (
                <RadioItem
                    key={option.id}
                    isSelected={value === option.id}
                    name={name}
                    option={option}
                    onSelect={() => !option.disabled && onChange(option.id)}
                />
            ))}
        </div>
    );
}

export function RadioItem({ option, isSelected, name, onSelect }: RadioItemProps) {
    return (
        <label
            className={cn(
                "group relative flex cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-all",
                isSelected && "border-primary bg-secondary/30",
                option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
            )}
        >
            <input
                aria-label={option.label}
                checked={isSelected}
                className="peer sr-only"
                disabled={option.disabled}
                name={name}
                type="radio"
                value={option.id}
                onChange={onSelect}
            />
            <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border">
                <span
                    className={cn("h-2.5 w-2.5 rounded-full bg-primary transition-all", isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0")}
                />
            </span>
            <div className="flex items-start gap-4">
                {option.icon && <option.icon className={cn("h-5 w-5 transition-colors", isSelected ? "text-primary" : "text-muted-foreground")} />}
                <div className="space-y-1">
                    <p className={cn("font-medium leading-none", isSelected && "text-primary")}>{option.label}</p>
                    {option.description && <p className="text-sm text-muted-foreground">{option.description}</p>}
                </div>
            </div>
        </label>
    );
}

const RadioGroupContext = React.createContext<{
    value?: string;
    onChange: (value: string) => void;
    name: string;
} | null>(null);

function useRadioGroupContext() {
    const context = React.useContext(RadioGroupContext);

    if (!context) {
        throw new Error("RadioGroup.Option must be used within a RadioGroup");
    }

    return context;
}

function Option({ value, children, className }: RadioOptionProps) {
    const { value: selectedValue, onChange, name } = useRadioGroupContext();
    const isSelected = value === selectedValue;

    return (
        <label
            className={cn(
                "flex items-center justify-between text-sm cursor-pointer py-4 border rounded-lg px-2 md:px-8 mb-2",
                isSelected && "border-primary",
                className
            )}
        >
            <input checked={isSelected} className="sr-only" name={name} type="radio" value={value} onChange={() => onChange(value)} />
            {children}
        </label>
    );
}

function Radio({ checked }: { checked: boolean }) {
    return (
        <div className="relative flex h-5 w-5 items-center justify-center">
            <div className="h-full w-full rounded-full border border-primary" />
            {checked && <div className="absolute h-3 w-3 rounded-full bg-primary" />}
        </div>
    );
}

function RadioGroup({ value, onChange, name, children, className }: RadioGroupProps) {
    return (
        <RadioGroupContext.Provider value={{ value, onChange, name }}>
            <div className={cn("", className)} role="radiogroup">
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
}

// Attach subcomponents
RadioGroup.Option = Option;
RadioGroup.Radio = Radio;

export { RadioGroup };
