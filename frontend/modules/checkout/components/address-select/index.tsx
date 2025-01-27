import { useMemo } from "react";
import { cartUpdate } from "@modules/checkout/actions";
import compareAddresses from "@lib/util/compare-addresses";
import { omit } from "@lib/util/util";
import { Star } from "nui-react-icons";

import { Listbox } from "@/components/ui/listbox";
import { cn } from "@/lib/util/cn";
import { ListboxItemProps } from "@/types/listbox";

type AddressSelectProps = {
    addresses: any[];
    cart: Omit<any, "refundable_amount" | "refunded_total"> | null;
};

// Custom item renderer example
const CustomItem = ({ option, isSelected, onSelect }: ListboxItemProps) => (
    <button
        aria-label="address"
        aria-selected={isSelected}
        className={cn(
            "relative flex w-full items-center gap-4 justify-between rounded-md px-3 py-2 text-sm transition-colors",
            "hover:bg-content2 hover:text-default-900",
            isSelected ? "bg-content1" : "bg-default"
        )}
        role="option"
        onClick={onSelect}
    >
        <div className="flex flex-col">
            <span className="text-left font-semibold">
                {option.firstname} {option.lastname}
            </span>
            {option.company && <span className="text-xs text-default-500">{option.company}</span>}
            <div className="flex flex-col text-left text-xs text-default-500">
                <span>
                    {option.address_1}
                    {option.address_2 && <span>, {option.address_2}</span>}
                </span>
                <span>
                    {option.postal_code}, {option.city}
                </span>
                <span>{option.state}</span>
            </div>
        </div>
        {isSelected && <Star aria-hidden="true" className="h-6 w-6 text-yellow-500" />}
    </button>
);

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
        <Listbox options={addresses} placeholder="Select an address..." renderItem={CustomItem} value={selectedAddress?.id} onChange={handleSelect} />
    );
};

export default AddressSelect;
