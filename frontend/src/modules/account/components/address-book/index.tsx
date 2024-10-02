import React from "react";
import { Address, Customer } from "types/global";

import AddAddress from "../address-card/add-address";
import EditAddress from "../address-card/edit-address-modal";

type AddressBookProps = {
    addresses: Address[];
};

const AddressBook: React.FC<AddressBookProps> = ({ addresses }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
                <AddAddress />
                {addresses?.map((address) => {
                    return <EditAddress key={address.id} address={address} />;
                })}
            </div>
        </div>
    );
};

export default AddressBook;
