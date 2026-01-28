import { useEffect } from "react";
import { useOverlayTriggerState } from "react-stately";
import { MenuIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import AdminMobileMenu from "@/components/admin/layouts/admin-mobile-menu";
import { useLocation, useRouteContext } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MenuComp: React.FC = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const state = useOverlayTriggerState({});
    const { session } = useRouteContext({ strict: false });

    useEffect(() => {
        state.close();
    }, [pathname]);

    return (
        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
            <DrawerTrigger className="md:hidden">
                <MenuIcon className="h-8 w-8" />
            </DrawerTrigger>
            <DrawerContent className="h-[calc(100vh-4rem)]">
                <DrawerHeader className="pb-0!">
                    <DrawerTitle>
                        <div className="flex items-center space-x-3 bg-primary -mx-4 -mt-4 p-4 overflow-hidden rounded-t-lg">
                            <Avatar>
                                <AvatarImage src={session?.user?.image!} />
                                <AvatarFallback className="bg-secondary">{session?.user?.first_name[0] || ""}</AvatarFallback>
                            </Avatar>

                            <div>
                                <div className="font-medium">
                                    {session?.user?.first_name} {session?.user?.last_name}
                                </div>
                                <div className="text-xs text-gray-300 text-left">{session?.user?.email}</div>
                            </div>
                        </div>
                    </DrawerTitle>
                </DrawerHeader>
                <AdminMobileMenu />
            </DrawerContent>
        </Drawer>
    );
};

export default MenuComp;
