import { Metadata } from "next";
import React from "react";

import { api } from "@/apis";
import { SettingsPage } from "@/components/admin/settings/settings-page";

export const metadata: Metadata = {
    title: "Settings",
};

export default async function AdminSettingsPage() {
    const { data, error } = await api.shopSettings.all();
    const { data: bankDetails } = await api.bank.getBankDetails();

    if (error) {
        console.error(error);
    }
    const settings = data || [];

    return <SettingsPage bankDetails={bankDetails || []} settings={settings} />;
}
