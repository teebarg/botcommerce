import { useEffect } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { MenuIcon } from "lucide-react";

import Menu from "../menu";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useLocation } from "@tanstack/react-router";

const StoreMenuComp: React.FC = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const state = useOverlayTriggerState({});

    useEffect(() => {
        state.close();
    }, [pathname]);

    return (
        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
            <DrawerTrigger asChild>
                <div aria-label="Menu" className="flex flex-col items-center">
                    <Button size="icon" variant="ghost">
                        <MenuIcon className="h-7 w-7" />
                    </Button>
                    <p className="text-xs">Menu</p>
                </div>
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
