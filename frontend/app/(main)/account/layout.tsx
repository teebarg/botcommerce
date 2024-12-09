import { getCustomer } from "@lib/data";
import AccountLayout from "@modules/account/templates/account-layout";
import { Customer } from "types/global";

export default async function AccountPageLayout({ dashboard }: { dashboard?: React.ReactNode }) {
    const customer = (await getCustomer()) as Customer;

    return <AccountLayout customer={customer}>{dashboard}</AccountLayout>;
}
