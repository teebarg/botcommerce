import { Outlet, createLazyFileRoute } from "@tanstack/react-router";
import ButtonNav from "@/components/layout/bottom-navbar";
import { ChatBubble } from "@/components/store/chat-widget/ChatBubble";
import StoreNavbar from "@/components/layout/shop-header";
import FloatingActionDeck from "@/components/store/collections/floating-deck";
import { LazyInView } from "@/components/LazyInView";
import Footer from "@/components/layout/footer";

export const Route = createLazyFileRoute("/_mainLayout")({
    component: MainLayoutComponent,
});

function MainLayoutComponent() {
    return (
        <div className="flex flex-col min-h-screen">
            <StoreNavbar />
            <main className="flex-1 flex flex-col pt-[var(--nav-height)] pb-8">
                <Outlet />
            </main>
            <LazyInView>
                <Footer />
            </LazyInView>
            <ChatBubble />
            <FloatingActionDeck />
            <ButtonNav />
        </div>
    );
}
