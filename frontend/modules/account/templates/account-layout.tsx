import React from "react";
import UnderlineLink from "@modules/common/components/interactive-link";
import { Customer } from "types/global";

import AccountNav from "../components/account-nav";

import RecommendedProducts from "@/modules/products/components/recommended";

interface AccountLayoutProps {
    customer: Omit<Customer, "password_hash">;
    children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ customer, children }) => {
    return (
        <div className="flex-1 sm:py-4 px-2 md:px-0" data-testid="account-page">
            <div className="flex-1 h-full max-w-6xl mx-auto bg-content1 flex flex-col rounded-md md:px-4">
                <div className="md:flex md:gap-4 py-4 md:py-12">
                    <div className="md:min-w-[15rem]">{customer && <AccountNav customer={customer} />}</div>
                    <div className="md:flex-1">{children}</div>
                </div>
                <div className="flex flex-col sm:flex-row items-end justify-between sm:border-t border-gray-300 dark:border-gray-500 py-12 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Got questions?</h3>
                        <span className="font-medium">You can find frequently asked questions and answers on our customer service page.</span>
                    </div>
                    <div>
                        <UnderlineLink href="/customer-service">Customer Service</UnderlineLink>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text:sm md:text-lg font-semibold">More to love</p>
                    <RecommendedProducts />
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
