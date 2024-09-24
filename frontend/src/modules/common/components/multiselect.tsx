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
                label={props.label}
                placeholder={props.placeholder}
                selectedKeys={value}
                selectionMode="multiple"
                variant={props.variant}
                onSelectionChange={setValue}
                {...props}
            >
                {options.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
            </Select>
            <input name={name} type="hidden" value={JSON.stringify(Array.from(value))} />
        </div>
    );
};

export { MultiSelect };
