import { createFileRoute, Outlet } from "@tanstack/react-router";

import { BackButton } from "@/components/back";
import ChatBotWrapper from "@/components/generic/chatbot";
import Cookie from "@/components/store/cookie-consent";
import Footer from "@/components/layout/footer";
import StoreNavbar from "@/components/layout/store-nav";
import ButtonNav from "@/components/layout/bottom-navbar";
import GetApp from "@/components/get-app";
import { SearchDialog } from "@/components/store/product-search";
import LocalizedClientLink from "@/components/ui/link";
import type { Session } from "start-authjs";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_mainLayout")({
    component: MainLayoutComponent,
    errorComponent: ({ error }) => {
        throw error;
    },
});

function MainLayoutComponent() {
    const { session } = Route.useRouteContext();
    return (
        <div className="flex flex-col">
            <StoreNavbar session={session as unknown as Session} />
            <div className="md:hidden sticky top-[env(safe-area-inset-top)] z-40 bg-background">
                <div className="flex items-center gap-2 px-2 py-3">
                    <div className="flex gap-2 items-center flex-1">
                        <BackButton />
                        <LocalizedClientLink href="/">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                            </div>
                        </LocalizedClientLink>
                    </div>
                    <SearchDialog />
                    <GetApp />
                </div>
            </div>
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
            <Footer />
            <Cookie />
            <ChatBotWrapper />
            <ButtonNav />
        </div>
    );
}
