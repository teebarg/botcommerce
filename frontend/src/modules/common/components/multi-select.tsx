import { CheckMini, ChevronDownMini, XMarkMini } from "nui-react-icons";
import React, { useEffect, useRef, useState } from "react";

interface Option {
    id: string;
    name: string;
}

interface MultiselectProps {
    label: string;
    options: Option[];
    [key: string]: any;
}

const Multiselect: React.FC<MultiselectProps> = ({ name, options, defaultValue, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    console.log(selectedKeys);

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
        .map((key) => options.find((opt) => opt.id === key))
        .filter((item): item is Option => item !== undefined);

    const toggleOption = (optionId: string) => {
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
            <div className="relative w-full" ref={containerRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Technologies</label>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(item.id);
                                        }}
                                        className="ml-1 hover:bg-blue-200 rounded-full"
                                    >
                                        <XMarkMini className="" />
                                    </button>
                                </span>
                            ))
                        )}
                    </div>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDownMini className="text-gray-400" aria-hidden="true" />
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                        <ul className="divide-y divide-gray-100">
                            {options.map((option) => (
                                <li
                                    key={option.id}
                                    className={`
                      px-3 py-2 flex items-center justify-between cursor-pointer
                      ${selectedKeys.has(option.id) ? "bg-blue-50" : ""}
                      hover:bg-gray-100
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
            <input name={name} type="hidden" value={JSON.stringify(Array.from(selectedItems))} />
            <div className="mt-4 text-sm text-gray-600">Selected: {selectedItems.length} items</div>
        </React.Fragment>
    );
};

export { Multiselect };
