import { Metadata } from "next";
import React from "react";

import BrandView from "@/components/admin/brands/brand-view";

export const metadata: Metadata = {
    title: "Brands",
};

export default async function BrandsPage() {
    return <BrandView />;
}
