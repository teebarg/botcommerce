import { Metadata } from "next";
import React from "react";
import { redirect } from "next/navigation";

import { SideBar } from "@/components/layout/sidebar";
import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { auth } from "@/actions/auth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    const user = await auth();

    if (!user) {
        redirect("/account");
    }

    return (
        <React.Fragment>
            <div className="flex">
                <span className="hidden sm:block min-w-[20rem] h-screen overflow-y-auto">
                    <SideBar />
                </span>
                <div className="flex-1 h-screen overflow-y-auto flex flex-col">
                    <AdminNavbar />
                    <main className="flex-1 flex flex-col bg-content1">{props.children}</main>
                </div>
            </div>
        </React.Fragment>
    );
}
