import React from "react";

import { BackButton } from "@/components/back";
import Search from "@/components/store/search";
import ChatBotWrapper from "@/components/generic/chatbot";
import Cookie from "@/components/store/cookie";
import Footer from "@/components/layout/footer";
import StoreNavbar from "@/components/layout/store-nav";
import ButtonNav from "@/components/layout/bottom-navbar";
import GetApp from "@/components/get-app";

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col flex-1">
            {/* <Banner /> */}
            <StoreNavbar />
            <div className="px-2 py-2 md:hidden sticky top-safe z-40 bg-background flex items-center gap-2">
                <BackButton />
                <Search className="justify-between w-full" />
                <GetApp />
            </div>
            <main className="flex-1 flex flex-col">{props.children}</main>
            <Cookie />
            <ChatBotWrapper />
            <Footer />
            <ButtonNav />
        </div>
    );
}
