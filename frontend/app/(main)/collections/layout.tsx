import React from "react";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return (
        <React.Fragment>
            <div className="w-full md:px-2 py-0 md:py-4 mx-auto max-w-8xl">
                <div className="flex gap-6">{children}</div>
            </div>
        </React.Fragment>
    );
}
