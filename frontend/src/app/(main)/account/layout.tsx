import { getCustomer } from "@lib/data";
import AccountLayout from "@modules/account/templates/account-layout";
import { Customer } from "types/global";

export default async function AccountPageLayout({ dashboard, login }: { dashboard?: React.ReactNode; login?: React.ReactNode }) {
    const customer = await getCustomer() as Customer;

    return <AccountLayout customer={customer}>{customer ? dashboard : login}</AccountLayout>;
}
