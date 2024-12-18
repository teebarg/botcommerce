import { Metadata } from "next";
import Footer from "@modules/layout/templates/footer";
import Navbar from "@modules/layout/templates/nav";
import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Banner } from "@modules/common/components/banner";
import { Cookie } from "@modules/store/components/cookie";
import ChatBot from "@components/chatbot";
import { Cart } from "nui-react-icons";

import Search from "@/modules/search/templates/search";
import { ButtonNav } from "@/components/bottom-navbar";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <React.Fragment>
            <Banner />
            <div className="flex items-center justify-center">
                <div className="flex w-full items-center gap-x-3 border-b-1 border-divider bg-gradient-to-r from-default-100 via-primary-100 to-secondary-100 px-2 md:px-6 py-2 sm:px-3.5 sm:before:flex-1">
                    <p className="text-small text-foreground font-semibold">
                        <LocalizedClientLink className="text-medium no-underline text-inherit" href={"/collections"} role="link">
                            GET FREE SHIPPING ON ₦20,000+ View Details
                        </LocalizedClientLink>
                    </p>
                    <div className="flex flex-1 justify-end" />
                </div>
            </div>
            <Navbar />
            <div className="px-4 py-2 md:hidden sticky top-0 z-30 bg-background flex items-center gap-2">
                <Search className="w-full justify-between flex-1" />
                <LocalizedClientLink className="text-default-500" href="/cart">
                    <Cart className="h-8 w-8" />
                </LocalizedClientLink>
            </div>
            <main>{props.children}</main>
            <Cookie />
            <ChatBot />
            <Footer />
            <ButtonNav />
        </React.Fragment>
    );
}
