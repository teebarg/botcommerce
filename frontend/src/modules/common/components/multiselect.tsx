import { Select, SelectItem, Selection } from "@nextui-org/react";
import React from "react";

interface MultiSelectProps {
    [key: string]: any;
    options: {
        value: string | number;
        label: string;
    }[];
}

const MultiSelect: React.FC<MultiSelectProps> = ({ name, options, className, defaultValue, ...props }) => {
    const [value, setValue] = React.useState<Selection>(new Set(defaultValue));

    React.useEffect(() => {
        setValue(new Set(defaultValue));
    }, [defaultValue]);

    return (
        <div className={`flex w-full flex-col gap-2 ${className}`}>
            <Select
                selectionMode="multiple"
                label={props.label}
                variant={props.variant}
                placeholder={props.placeholder}
                selectedKeys={value}
                onSelectionChange={setValue}
                {...props}
            >
                {options.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
            </Select>
            <input type="hidden" name={name} value={JSON.stringify(Array.from(value))} />
        </div>
    );
};

export { MultiSelect };
