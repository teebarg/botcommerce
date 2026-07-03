import type React from "react";
import MobileFilter from "@/components/store/mobile-filter";
import ShareButton from "@/components/share";

export const FloatingActionDeck: React.FC = () => {
    return (
        <div className="fixed bottom-40 right-4 z-50 flex flex-col gap-3 md:hidden">
            <ShareButton />
            <MobileFilter />
        </div>
    );
};

export default FloatingActionDeck;