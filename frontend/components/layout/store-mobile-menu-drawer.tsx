"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { MenuIcon } from "lucide-react";

import Menu from "../menu";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const StoreMenuComp: React.FC = () => {
    const pathname = usePathname();
    const state = useOverlayTriggerState({});

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
                <DrawerHeader className="sr-only">
                    <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <Menu />
            </DrawerContent>
        </Drawer>
    );
};

export default StoreMenuComp;
