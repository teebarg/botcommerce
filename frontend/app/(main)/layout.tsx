import React from "react";

import { BackButton } from "@/components/back";
import Search from "@/components/store/search";
import ChatBotWrapper from "@/components/generic/chatbot";
import Cookie from "@/components/store/cookie";
import Footer from "@/components/layout/footer";
import StoreNavbar from "@/components/layout/store-nav";
import ButtonNav from "@/components/layout/bottom-navbar";
import ClientOnly from "@/components/generic/client-only";
import GetApp from "@/components/get-app";

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* <Banner /> */}
            <StoreNavbar />
            <div className="px-2 py-2 md:hidden sticky top-0 z-40 bg-background flex items-center gap-2">
                <BackButton />
                <Search className="justify-between w-full" />
                <GetApp />
            </div>
            <main className="flex-1 flex flex-col">{props.children}</main>
            <Cookie />
            <ChatBotWrapper />
            <ClientOnly>
                <Footer />
            </ClientOnly>
            <ButtonNav />
        </div>
    );
}
