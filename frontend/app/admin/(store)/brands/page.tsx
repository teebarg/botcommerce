import { Metadata } from "next";
import React from "react";

import BrandView from "@/components/admin/brands/brand-view";
import ClientOnly from "@/components/client-only";

export const metadata: Metadata = {
    title: "Brands",
};

export default async function BrandsPage() {
    return (
        <ClientOnly>
            <BrandView />
        </ClientOnly>
    );
}
