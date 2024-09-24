import React from "react";
import { Customer } from "types/global";

import AddAddress from "../address-card/add-address";
import EditAddress from "../address-card/edit-address-modal";

type AddressBookProps = {
    customer: Omit<Customer, "password_hash">;
};

const AddressBook: React.FC<AddressBookProps> = ({ customer }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
                <AddAddress />
                {customer.shipping_addresses?.map((address) => {
                    return <EditAddress key={address.id} address={address} />;
                })}
            </div>
        </div>
    );
};

export default AddressBook;
