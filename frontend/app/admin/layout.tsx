import { Metadata } from "next";
import React from "react";
import AdminNavbar from "@modules/admin/components/admin-navbar";
import { redirect } from "next/navigation";
import { SideBar } from "@modules/common/components/sidebar";
import { api } from "@/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    const user = await api.user.me();

    if (!user) {
        redirect("/account");
    }

    return (
        <React.Fragment>
            <div className="flex min-h-screen">
                <span className="hidden sm:block min-w-[20rem] h-screen overflow-y-auto">
                    <SideBar />
                </span>
                <div className="flex-1 h-screen overflow-y-auto flex flex-col">
                    <AdminNavbar />
                    <main className="flex-1">{props.children}</main>
                </div>
            </div>
        </React.Fragment>
    );
}
