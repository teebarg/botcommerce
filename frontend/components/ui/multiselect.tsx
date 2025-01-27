import { CheckMini, ChevronDownMini, XMarkMini } from "nui-react-icons";
import React, { useEffect, useRef, useState } from "react";

interface Option {
    id: string | number;
    name: string;
}

interface MultiselectProps {
    label: string;
    options: Option[];
    [key: string]: any;
}

const Multiselect: React.FC<MultiselectProps> = ({ name, label, options, defaultValue, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedKeys(new Set(defaultValue));
    }, [defaultValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedItems = Array.from(selectedKeys)
        .map((key) => options.find((opt) => opt.id == key))
        .filter((item): item is Option => item !== undefined);

    const toggleOption = (optionId: string | number) => {
        const newKeys = new Set(selectedKeys);

        if (newKeys.has(optionId)) {
            newKeys.delete(optionId);
        } else {
            newKeys.add(optionId);
        }
        setSelectedKeys(newKeys);
    };

    return (
        <React.Fragment>
            <div ref={containerRef} className="group relative w-full" data-has-label={label ? "true" : "false"}>
                <label className="hidden group-data-[has-label=true]:block text-xs font-medium text-default-500 mb-1">{label}</label>
                <button
                    aria-label="select"
                    className="relative w-full bg-content1 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex flex-wrap gap-1">
                        {selectedItems.length === 0 ? (
                            <span className="text-gray-500">Select options...</span>
                        ) : (
                            selectedItems.map((item) => (
                                <span
                                    key={item.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                    {item.name}
                                    <span
                                        className="ml-1 hover:bg-blue-200 rounded-full"
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(item.id);
                                        }}
                                    >
                                        <XMarkMini />
                                    </span>
                                </span>
                            ))
                        )}
                    </div>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDownMini aria-hidden="true" className="text-gray-400" />
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-default-100 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                        <ul className="divide-y divide-default-100">
                            {options.map((option) => (
                                <li
                                    key={option.id}
                                    className={`
                                        px-3 py-2 flex items-center justify-between cursor-pointer
                                        ${selectedKeys.has(option.id) ? "bg-default-100" : ""}
                                        hover:bg-default-100
                                    `}
                                    onClick={() => toggleOption(option.id)}
                                >
                                    <span>{option.name}</span>
                                    {selectedKeys.has(option.id) && <CheckMini className="text-blue-600" />}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <input name={name} type="hidden" value={JSON.stringify(Array.from(selectedKeys))} />
        </React.Fragment>
    );
};

export { Multiselect };
