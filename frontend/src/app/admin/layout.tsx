import { Metadata } from "next";
import Footer from "@modules/layout/templates/footer";
import Navbar from "@modules/layout/templates/nav";
import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Banner } from "@modules/common/components/banner";
import { Cookie } from "@modules/store/components/cookie";
import { Chatbot } from "@modules/store/components/chatbot";
import Sidebar from "@modules/admin/components/sidebar";
import AdminNavbar from "@modules/admin/components/admin-navbar";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <React.Fragment>
            <div className="flex min-h-screen">
                <aside className="hidden sm:block min-w-[20rem] h-screen overflow-y-auto">
                    <Sidebar />
                </aside>
                <div className="flex-1 h-screen overflow-y-auto">
                    <AdminNavbar />
                    <main>{props.children}</main>
                </div>
            </div>
            {/* <Banner />
            <div className="flex items-center justify-center">
                <div className="flex w-full items-center gap-x-3 border-b-1 border-divider bg-gradient-to-r from-default-100 via-danger-100 to-secondary-100 px-6 py-2 sm:px-3.5 sm:before:flex-1">
                    <p className="text-small text-foreground">
                        <LocalizedClientLink className="text-medium no-underline text-inherit" href={"/collections"} role="link">
                            GET FREE SHIPPING ON ₦20,000+ View Details
                        </LocalizedClientLink>
                    </p>
                    <div className="flex flex-1 justify-end" />
                </div>
            </div>
            <Navbar />
            <main>{props.children}</main>
            <Cookie />
            <Chatbot />
            <Footer /> */}
        </React.Fragment>
    );
}
