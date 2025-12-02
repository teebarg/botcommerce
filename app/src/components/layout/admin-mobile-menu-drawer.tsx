"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { MenuIcon } from "lucide-react";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import AdminMobileMenu from "@/components/admin/layouts/admin-mobile-menu";

const MenuComp: React.FC = () => {
    const pathname = usePathname();
    const state = useOverlayTriggerState({});

    useEffect(() => {
        state.close();
    }, [pathname]);

    return (
        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
            <DrawerTrigger className="md:hidden">
                <MenuIcon className="h-8 w-8" />
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="sr-only">
                    <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <AdminMobileMenu />
            </DrawerContent>
        </Drawer>
    );
};

export default MenuComp;
