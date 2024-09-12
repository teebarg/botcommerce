import { ChangeEvent, useState } from "react";
import { Radio, RadioGroup } from "@nextui-org/radio";

type FilterRadioGroupProps = {
    title: string;
    items: {
        value: string;
        label: string;
    }[];
    value: any;
    handleChange: (...args: any[]) => void;
    "data-testid"?: string;
};

const FilterRadioGroup = ({ title, items, value, handleChange, "data-testid": dataTestId }: FilterRadioGroupProps) => {
    const [selected, setSelected] = useState<string>(value);

    return (
        <div className="flex gap-x-3 flex-col gap-y-3">
            <p className="text-default-400">{title}</p>
            <RadioGroup data-testid={dataTestId} label="Select your favorite city" value={selected} onValueChange={setSelected}>
                {items?.map((i) => (
                    <Radio key={i.value} value={i.value} onClick={(e) => handleChange(e as unknown as ChangeEvent<HTMLButtonElement>, i.value)}>
                        {i.label}
                    </Radio>
                ))}
            </RadioGroup>
        </div>
    );
};

export default FilterRadioGroup;
