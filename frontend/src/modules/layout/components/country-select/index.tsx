"use client";

import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { StateType } from "@lib/hooks/use-toggle-state";
import { updateRegion } from "app/actions";
import { useParams, usePathname } from "next/navigation";

type CountryOption = {
    country: string;
    region: string;
    label: string;
};

type CountrySelectProps = {
    toggleState: StateType;
    regions: any[];
};

const CountrySelect = ({ toggleState, regions }: CountrySelectProps) => {
    const [current, setCurrent] = useState<CountryOption | undefined>(undefined);

    const { countryCode } = useParams();
    const currentPath = usePathname().split(`/${countryCode}`)[1];

    const { state, close } = toggleState;

    const options: CountryOption[] | undefined = useMemo(() => {
        return regions
            ?.map((r) => {
                return r.countries.map((c) => ({
                    country: c.iso_2,
                    region: r.id,
                    label: c.display_name,
                }));
            })
            .flat()
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [regions]);

    useEffect(() => {
        if (countryCode) {
            const option = options?.find((o) => o.country === countryCode);

            setCurrent(option);
        }
    }, [options, countryCode]);

    const handleChange = (option: CountryOption) => {
        updateRegion(option.country, currentPath);
        close();
    };

    return (
        <div>
            <Listbox as="span" defaultValue={countryCode ? options?.find((o) => o.country === countryCode) : undefined} onChange={handleChange}>
                <Listbox.Button className="py-1 w-full">
                    <div className="flex items-start gap-x-2">
                        <span>Shipping to:</span>
                    </div>
                </Listbox.Button>
                <div className="flex relative w-full min-w-[320px]">
                    <Transition as={Fragment} leave="transition ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0" show={state}>
                        <Listbox.Options
                            static
                            className="absolute -bottom-[calc(100%-36px)] left-0 xs:left-auto xs:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-sm uppercase text-black no-scrollbar rounded-lg w-full"
                        >
                            {options?.map((o, index) => {
                                return (
                                    <Listbox.Option
                                        key={index}
                                        className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2"
                                        value={o}
                                    >
                                        {o.label}
                                    </Listbox.Option>
                                );
                            })}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

export default CountrySelect;
