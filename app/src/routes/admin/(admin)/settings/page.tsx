import { Metadata } from "next";
import React from "react";

import { SettingsPage } from "@/components/admin/settings/settings-page";

export const metadata: Metadata = {
    title: "Settings",
};

export default async function AdminSettingsPage() {
    return <SettingsPage />;
}
