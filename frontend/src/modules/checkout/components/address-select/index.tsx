import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDown } from "nui-react-icons";
import { Fragment, useMemo } from "react";
import clsx from "clsx";
import Radio from "@modules/common/components/radio";
import { cartUpdate } from "@modules/checkout/actions";
import compareAddresses from "@lib/util/compare-addresses";
import { omit } from "@lib/util/util";

type AddressSelectProps = {
    addresses: any[];
    cart: Omit<any, "refundable_amount" | "refunded_total"> | null;
};

const AddressSelect = ({ addresses, cart }: AddressSelectProps) => {
    const handleSelect = (id: string) => {
        const savedAddress = addresses.find((a) => a.id === id);

        if (savedAddress) {
            cartUpdate({
                shipping_address: omit(savedAddress, ["id", "created_at", "updated_at", "country", "deleted_at", "metadata", "customer_id"]) as any,
            });
        }
    };

    const selectedAddress = useMemo(() => {
        return addresses.find((a) => compareAddresses(a, cart?.shipping_address));
    }, [addresses, cart?.shipping_address]);

    return (
        <Listbox value={selectedAddress?.id} onChange={handleSelect}>
            <div className="relative">
                <Listbox.Button
                    className="relative w-full flex justify-between items-center px-4 py-[10px] text-left cursor-default focus:outline-none border rounded-lg focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-gray-300 focus-visible:ring-offset-2 focus-visible:border-gray-300 text-base"
                    data-testid="shipping-address-select"
                >
                    {({ open }) => (
                        <>
                            <span className="block truncate">{selectedAddress ? selectedAddress.address_1 : "Choose an address"}</span>
                            <ChevronUpDown
                                className={clsx("transition-rotate duration-200", {
                                    "transform rotate-180": open,
                                })}
                            />
                        </>
                    )}
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options
                        className="absolute z-20 w-full overflow-auto text-sm bg-default-50 border border-top-0 max-h-60 focus:outline-none sm:text-sm"
                        data-testid="shipping-address-options"
                    >
                        {addresses.map((address) => {
                            return (
                                <Listbox.Option
                                    key={address.id}
                                    className="cursor-default select-none relative pl-6 pr-10 hover:bg-default-100 py-4"
                                    data-testid="shipping-address-option"
                                    value={address.id}
                                >
                                    <div className="flex gap-x-4 items-start">
                                        <Radio checked={selectedAddress?.id === address.id} data-testid="shipping-address-radio" />
                                        <div className="flex flex-col">
                                            <span className="text-left text-base">
                                                {address.first_name} {address.last_name}
                                            </span>
                                            {address.company && <span className="text-sm text-default-800">{address.company}</span>}
                                            <div className="flex flex-col text-left text-base mt-2">
                                                <span>
                                                    {address.address_1}
                                                    {address.address_2 && <span>, {address.address_2}</span>}
                                                </span>
                                                <span>
                                                    {address.postal_code}, {address.city}
                                                </span>
                                                <span>{address.state && `${address.state}`}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Listbox.Option>
                            );
                        })}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};

export default AddressSelect;
