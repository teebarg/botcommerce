import React from "react";
import clsx from "clsx";
import { onlyUnique } from "@lib/util/only-unique";

type OptionSelectProps = {
    option: any;
    current: string;
    updateOption: (option: Record<string, string>) => void;
    title: string;
    disabled: boolean;
    "data-testid"?: string;
};

const OptionSelect: React.FC<OptionSelectProps> = ({ option, current, updateOption, title, "data-testid": dataTestId, disabled }) => {
    const filteredOptions = option.values.map((v) => v.value).filter(onlyUnique);

    return (
        <div className="flex flex-col gap-y-2 mt-2">
            <span className="text-xs">Select {title}</span>
            <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
                {filteredOptions.map((v) => {
                    return (
                        <button
                            key={v}
                            className={clsx("bg-default-100 border text-sm h-10 rounded-lg p-2 min-w-20", {
                                "border-blue-500": v === current,
                                "hover:shadow-md transition-shadow ease-in-out duration-150": v !== current,
                            })}
                            data-testid="option-button"
                            disabled={disabled}
                            onClick={() => updateOption({ [option.id]: v })}
                        >
                            {v}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default OptionSelect;
