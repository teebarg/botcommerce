import { Metadata } from "next";
import React from "react";

import { SideBar } from "@/components/layout/sidebar";
import AdminNavbar from "@/components/admin/layouts/admin-navbar";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <span className="hidden sm:block min-w-[20rem] h-screen overflow-y-auto">
                <SideBar />
            </span>
            <div className="flex-1 h-screen overflow-y-auto flex flex-col">
                <AdminNavbar />
                <main className="flex-1 flex flex-col">{props.children}</main>
            </div>
        </div>
    );
}
