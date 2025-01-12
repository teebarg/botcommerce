import React from "react";
import { SortOptions } from "types/global";

type Props = {
    children: React.ReactNode;
    params?: { slug: string };
    searchParams?: {
        page?: number;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
};

export default async function CheckoutLayout({ children }: Props) {
    return (
        <React.Fragment>
            <div className="w-full md:px-2 py-0 md:py-4 mx-auto max-w-9xl">
                <div className="flex gap-6 mt-0 md:mt-6">{children}</div>
            </div>
        </React.Fragment>
    );
}
