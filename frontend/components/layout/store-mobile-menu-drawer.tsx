"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { MenuIcon } from "lucide-react";

import Menu from "../menu";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Session } from "@/types/models";

interface StoreMenuCompProps {
    user: Session | null;
}

const StoreMenuComp: React.FC<StoreMenuCompProps> = ({ user }) => {
    const pathname = usePathname();
    const state = useOverlayTriggerState({});

    // 🧼 Close drawer on route change
    useEffect(() => {
        state.close();
    }, [pathname]);

    return (
        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
            <DrawerTrigger>
                <span className="flex flex-col items-center">
                    <MenuIcon className="h-8 w-8" />
                    Menu
                </span>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="sr-only">Menu</DrawerTitle>
                </DrawerHeader>
                <Menu user={user} />
            </DrawerContent>
        </Drawer>
    );
};

export default StoreMenuComp;
