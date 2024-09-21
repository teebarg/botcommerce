import { Metadata } from "next";
import { getCustomer, listCustomerOrders } from "@lib/data";
import Overview from "@modules/account/components/overview";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Account",
    description: "Overview of your account activity.",
};

export default async function OverviewTemplate() {
    const customer = await getCustomer().catch(() => null);
    // console.log(customer)
    const orders = (await listCustomerOrders().catch(() => null)) || null;
    console.log("listing orders......")

    if (!customer) {
        notFound();
    }

    return <div>sjjsjsjsshhhhhssss</div>

    return <Overview customer={customer} orders={orders} />;
}
