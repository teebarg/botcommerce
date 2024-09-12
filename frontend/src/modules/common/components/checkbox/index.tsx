import { Checkbox } from "@nextui-org/checkbox";
import React from "react";

type CheckboxProps = {
    checked?: boolean;
    onChange?: () => void;
    label: string;
    name?: string;
    "data-testid"?: string;
};

const CheckboxWithLabel: React.FC<CheckboxProps> = ({ checked = true, onChange, label, name, "data-testid": dataTestId }) => {
    return (
        <div className="flex items-center space-x-2 ">
            <Checkbox
                aria-checked={checked}
                className="text-base flex items-center gap-x-2"
                data-testid={dataTestId}
                id="checkbox"
                isSelected={checked}
                name={name}
                type="button"
                onValueChange={onChange}
            />
            <label className="!transform-none !text-base" htmlFor="checkbox">
                {label}
            </label>
        </div>
    );
};

export default CheckboxWithLabel;
