import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/layout/footer";
import ButtonNav from "@/components/layout/bottom-navbar";
import { ChatBubble } from "@/components/store/chat-widget/ChatBubble";
import { StickyCartBar } from "@/components/store/cart/sticky-cart";
import StoreNavbar from "@/components/layout/shop-header";
import FloatingActionDeck from "@/components/store/collections/floating-deck";

export const Route = createFileRoute("/_mainLayout")({
    component: MainLayoutComponent,
    errorComponent: ({ error }) => {
        throw error;
    },
});

function MainLayoutComponent() {
    return (
        <div className="flex flex-col min-h-screen">
            <StoreNavbar />
            <StickyCartBar />
            <main className="flex-1 flex flex-col pt-16 md:pt-0 pb-8">
                <Outlet />
            </main>
            <Footer />
            <ChatBubble />
            <FloatingActionDeck />
            <ButtonNav />
        </div>
    );
}
