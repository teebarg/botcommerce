"use client";

import ComponentLoader from "@/components/component-loader";

export default function CheckoutSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8 px-52 pt-10">
            <ComponentLoader className="rounded-md h-192 mt-14" />
            <div className="relative hidden md:block">
                <ComponentLoader className="h-192 w-full rounded-md" />
            </div>
        </div>
    );
}
