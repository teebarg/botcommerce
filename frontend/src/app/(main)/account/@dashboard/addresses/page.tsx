import { Metadata } from "next";
import { notFound } from "next/navigation";
import AddressBook from "@modules/account/components/address-book";
import { getCustomer } from "@lib/data";

export const metadata: Metadata = {
    title: "Addresses",
    description: "View your addresses",
};

export default async function Addresses() {
    const customer = await getCustomer();

    if (!customer) {
        notFound();
    }

    return (
        <div className="w-full" data-testid="addresses-page-wrapper">
            <div className="mb-8 flex flex-col gap-y-4">
                <h1 className="text-xl">Shipping Addresses</h1>
                <p className="text-sm">
                    View and update your shipping addresses, you can add as many as you like. Saving your addresses will make them available during
                    checkout.
                </p>
            </div>
            <AddressBook customer={customer} region={null} />
        </div>
    );
}
