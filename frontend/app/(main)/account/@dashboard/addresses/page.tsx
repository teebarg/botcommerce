import { Metadata } from "next";
import AddressBook from "@components/store/account/address/address-book";

export const metadata: Metadata = {
    title: "Addresses",
};

export default async function Addresses() {
    return (
        <div className="w-full" data-testid="addresses-page-wrapper">
            <div className="mb-8 flex flex-col gap-y-2">
                <h1 className="text-xl font-semibold">Shipping Addresses</h1>
                <p className="text-sm text-default-700">
                    View and update your shipping addresses, you can add as many as you like. Saving your addresses will make them available during
                    checkout.
                </p>
            </div>
            <AddressBook />
        </div>
    );
}
