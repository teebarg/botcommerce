import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BackButton } from "@/components/back";
// import ChatBotWrapper from "@/components/generic/chatbot";
import Cookie from "@/components/store/cookie-consent";
import Footer from "@/components/layout/footer";
import StoreNavbar from "@/components/layout/store-nav";
import ButtonNav from "@/components/layout/bottom-navbar";
import GetApp from "@/components/get-app";
import { SearchDialog } from "@/components/store/product-search";
import type { Session } from "start-authjs";
import { ShoppingBag } from "lucide-react";
import { ChatBubble } from "@/components/store/chat-widget/ChatBubble";

export const Route = createFileRoute("/_mainLayout")({
    component: MainLayoutComponent,
    errorComponent: ({ error }) => {
        throw error;
    },
});

function MainLayoutComponent() {
    const { session } = Route.useRouteContext();
    return (
        <div className="flex flex-col min-h-screen">
            <StoreNavbar session={session as unknown as Session} />
            <div className="md:hidden sticky top-[env(safe-area-inset-top)] z-40 bg-blur">
                <div className="flex items-center gap-2 px-2 py-3">
                    <div className="flex gap-2 items-center flex-1">
                        <BackButton />
                        <Link to="/">
                            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                        </Link>
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
            {/* <ChatBotWrapper /> */}
            <ChatBubble />
            <ButtonNav />
        </div>
    );
}
