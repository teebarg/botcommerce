import { siteConfig } from "@/lib/config";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: `Settings Page | Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

export default async function SettingsPage() {
    return (
        <React.Fragment>
            <p>This is settings page</p>
        </React.Fragment>
    );
}
