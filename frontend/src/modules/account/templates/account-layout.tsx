import React from "react";
import UnderlineLink from "@modules/common/components/interactive-link";

import AccountNav from "../components/account-nav";
import { Customer } from "types/global";

interface AccountLayoutProps {
    customer: Omit<Customer, "password_hash">;
    children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ customer, children }) => {
    return (
        <div className="flex-1 sm:py-4" data-testid="account-page">
            <div className="flex-1 h-full max-w-6xl mx-auto bg-default-50 flex flex-col rounded-md px-4">
                <div className="flex gap-4 py-12">
                    <div className="min-w-[15rem]">{customer && <AccountNav customer={customer} />}</div>
                    <div className="flex-1">{children}</div>
                </div>
                <div className="flex flex-col sm:flex-row items-end justify-between sm:border-t border-gray-300 dark:border-gray-500 py-12 gap-8">
                    <div>
                        <h3 className="text-xl-semi mb-4">Got questions?</h3>
                        <span className="txt-medium">You can find frequently asked questions and answers on our customer service page.</span>
                    </div>
                    <div>
                        <UnderlineLink href="/customer-service">Customer Service</UnderlineLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
