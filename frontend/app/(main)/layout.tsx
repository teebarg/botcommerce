import { Metadata } from "next";
import Footer from "@modules/layout/templates/footer";
import React from "react";
import { BackButton } from "@/components/back";
import dynamic from "next/dynamic";

const Banner = dynamic(() => import("@modules/common/components/banner"), { ssr: false });
const ButtonNav = dynamic(() => import("@/components/bottom-navbar"), { ssr: false });
const Cookie = dynamic(() => import("@modules/store/components/cookie"), { ssr: false });
const ChatBot = dynamic(() => import("@components/chatbot"), { ssr: false });
const Navbar = dynamic(() => import("@modules/layout/templates/nav"), { ssr: false });
const Search = dynamic(() => import("@/modules/search/components/search"), { ssr: false });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <React.Fragment>
            <Banner />
            <Navbar />
            <div className="px-4 py-2 md:hidden sticky top-0 z-40 bg-background flex items-center gap-4 select-none">
                <BackButton />
                <Search className="w-full justify-between flex-1" />
            </div>
            <main>{props.children}</main>
            <Cookie />
            <ChatBot />
            <Footer />
            <ButtonNav />
        </React.Fragment>
    );
}
