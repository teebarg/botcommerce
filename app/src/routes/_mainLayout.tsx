import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/layout/footer";
import StoreNavbar from "@/components/layout/store-nav";
import ButtonNav from "@/components/layout/bottom-navbar";
import { ChatBubble } from "@/components/store/chat-widget/ChatBubble";
import MobileHeader from "@/components/layout/mobile-navbar";

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
            <MobileHeader />
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
            <Footer />
            <ChatBubble />
            <ButtonNav />
        </div>
    );
}
