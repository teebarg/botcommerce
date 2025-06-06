import React from "react";

import AddAddress from "../address-card/add-address";
import EditAddress from "../address-card/edit-address-modal";

import { Address } from "@/types/models";

type AddressBookProps = {
    addresses: Address[];
};

const AddressBook: React.FC<AddressBookProps> = ({ addresses }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
                <AddAddress />
                {addresses?.map((address, idx: number) => {
                    return <EditAddress key={idx} address={address} />;
                })}
            </div>
        </div>
    );
};

export default AddressBook;
