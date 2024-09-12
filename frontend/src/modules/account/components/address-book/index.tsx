
import React from "react";

import AddAddress from "../address-card/add-address";
import EditAddress from "../address-card/edit-address-modal";

type AddressBookProps = {
    customer: Omit<any, "password_hash">;
    region: any;
};

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
                <AddAddress region={region} />
                {customer.shipping_addresses.map((address) => {
                    return <EditAddress key={address.id} address={address} region={region} />;
                })}
            </div>
        </div>
    );
};

export default AddressBook;
