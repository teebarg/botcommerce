import type React from "react";
import MobileFilter from "@/components/store/mobile-filter";
import ShareButton from "@/components/share";
import { useLocation } from "@tanstack/react-router";

export const FloatingActionDeck: React.FC = () => {
    const location = useLocation();
    const show = location.pathname.startsWith("/collections");
    if (!show) {
        return null
    }
    return (
        <div className="fixed bottom-40 right-4 z-50 flex flex-col gap-3 md:hidden">
            <ShareButton />
            <MobileFilter />
        </div>
    );
};

export default FloatingActionDeck;