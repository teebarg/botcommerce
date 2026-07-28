import React, { Suspense } from "react";
import ButtonNav from "@/components/layout/bottom-navbar";
import { ChatBubble } from "@/components/store/chat-widget/ChatBubble";
import StoreNavbar from "@/components/layout/shop-header";
import FloatingActionDeck from "@/components/store/collections/floating-deck";
import { LazyInView } from "@/components/LazyInView";
const Footer = React.lazy(() => import("@/components/layout/footer"));

interface StoreLayoutShellProps {
    children: React.ReactNode;
}

export function StoreLayoutShell({ children }: StoreLayoutShellProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <StoreNavbar />
            <main className="flex-1 flex flex-col pt-[var(--nav-height)] pb-8">
                {children}
            </main>
            <LazyInView>
                <Suspense fallback={<div className="h-40 w-full animate-pulse bg-muted/10" />} >
                    <Footer />
                </Suspense>
            </LazyInView>
            <ChatBubble />
            <FloatingActionDeck />
            <ButtonNav />
        </div>
    );
}
