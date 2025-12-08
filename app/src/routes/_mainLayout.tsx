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
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/_mainLayout")({
    component: MainLayoutComponent,
    errorComponent: ({ error }) => {
        throw error;
    },
});

function MainLayoutComponent() {
    const { config } = useConfig();
    const { session } = Route.useRouteContext();
    return (
        <div className="flex flex-col flex-1">
            <StoreNavbar session={session as unknown as Session} />
            <div className="safe-top-mask md:hidden" />
            <div className="md:hidden sticky top-[env(safe-area-inset-top)] z-40 bg-background">
                <div className="flex items-center gap-2 px-2 py-3">
                    <div className="flex gap-2 items-center flex-1">
                        <BackButton />
                        <LocalizedClientLink className="text-3xl block h-12 w-12" href="/">
                            <img alt="Logo" className="h-full w-full object-contain" src="/icon.png" />
                        </LocalizedClientLink>
                        <span className="tracking-tighter font-bold text-lg uppercase">{config?.shop_name}</span>
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
