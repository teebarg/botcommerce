import { Metadata } from "next";
import React from "react";
import AdminNavbar from "@modules/admin/components/admin-navbar";
import { getCustomer } from "@lib/data";
import { redirect } from "next/navigation";
import { SideBar } from "@modules/common/components/sidebar";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    const customer = await getCustomer().catch(() => null);

    if (!customer) {
        redirect("/account");
    }

    return (
        <React.Fragment>
            <div className="flex min-h-screen">
                <span className="hidden sm:block min-w-[20rem] h-screen overflow-y-auto">
                    <SideBar />
                </span>
                <div className="flex-1 h-screen overflow-y-auto">
                    <AdminNavbar />
                    <main>{props.children}</main>
                </div>
            </div>
        </React.Fragment>
    );
}
