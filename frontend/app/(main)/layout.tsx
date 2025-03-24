import { Metadata } from "next";
import Footer from "@modules/layout/templates/footer";
import React from "react";
import dynamic from "next/dynamic";

import { BackButton } from "@/components/back";
import Search from "@/modules/search/components/search";

const Banner = dynamic(() => import("@modules/common/components/banner"), { loading: () => <p>Loading...</p> });
const ButtonNav = dynamic(() => import("@/components/bottom-navbar"));
const Cookie = dynamic(() => import("@modules/store/components/cookie"));
const ChatBot = dynamic(() => import("@components/chatbot"));
const Navbar = dynamic(() => import("@modules/layout/templates/nav"));
// const Search = dynamic(() => import("@/modules/search/components/search"));

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* <Banner /> */}
            <Navbar />
            <div className="px-4 py-2 md:hidden sticky top-0 z-40 bg-background flex items-center gap-4 select-none">
                <BackButton />
                <Search className="justify-between w-full" />
            </div>
            <main className="flex-1 flex flex-col">{props.children}</main>
            <Cookie />
            <ChatBot />
            <Footer />
            <ButtonNav />
        </div>
    );
}
