import {
    Home,
    Settings,
    Users,
    Menu,
    ChevronUp,
    LogOut,
    PanelLeftIcon,
    User,
    Star,
    Activity,
    MessageSquare,
    Layers,
    LayoutGrid,
    UserSquare,
    ClipboardList,
    Notebook,
    Image,
    ShoppingCart,
    Tag,
    ShoppingBag,
} from "lucide-react";
import { useRouteContext } from "@tanstack/react-router";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";
import { UserAvatar } from "@/components/generic/user-avatar";
import LocalizedClientLink from "@/components/ui/link";

const AdminItems = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Dashboard",
        url: "/admin",
        icon: Menu,
    },
    {
        title: "Users",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Activities",
        url: "/admin/activities",
        icon: Activity,
    },
    {
        title: "Chats",
        url: "/admin/chats",
        icon: MessageSquare,
    },
    {
        title: "FAQs",
        url: "/admin/faqs",
        icon: Notebook,
    },
    {
        title: "Online",
        url: "/admin/online",
        icon: UserSquare,
    },
];

const AccountItems = [
    {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
    },
    {
        title: "Profile",
        url: "/account/profile",
        icon: User,
    },
];

const storeItems = [
    // {
    //     title: "Products",
    //     url: "/admin/products",
    //     icon: Box,
    // },
    {
        title: "Gallery",
        url: "/admin/gallery",
        icon: Image,
    },
    {
        title: "Abandoned Carts",
        url: "/admin/abandoned-carts",
        icon: ShoppingCart,
    },
    {
        title: "Orders",
        url: "/admin/orders",
        icon: ClipboardList,
    },
    {
        title: "Reviews",
        url: "/admin/reviews",
        icon: Star,
    },
    {
        title: "Categories",
        url: "/admin/categories",
        icon: Layers,
    },
    {
        title: "Collections",
        url: "/admin/collections",
        icon: LayoutGrid,
    },
    {
        title: "Catalog",
        url: "/admin/shared",
        icon: LayoutGrid,
    },
    {
        title: "Coupons",
        url: "/admin/coupons",
        icon: Tag,
    },
];

export function AdminSidebar() {
    const { session } = useRouteContext({ strict: false });
    const { toggleSidebar, state } = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="justify-between">
                            <PanelLeftIcon onClick={toggleSidebar} />
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {AdminItems.map((item, idx: number) => (
                                <SidebarMenuItem key={idx}>
                                    <SidebarMenuButton asChild>
                                        <LocalizedClientLink href={item.url} active="bg-primary/20 text-primary">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </LocalizedClientLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Store</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {storeItems.map((item, idx: number) => (
                                <SidebarMenuItem key={idx}>
                                    <SidebarMenuButton asChild>
                                        <LocalizedClientLink href={item.url} active="bg-primary/20 text-primary">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </LocalizedClientLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {AccountItems.map((item, idx: number) => (
                                <SidebarMenuItem key={idx}>
                                    <SidebarMenuButton asChild>
                                        <LocalizedClientLink href={item.url} active="bg-primary/20 text-primary">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </LocalizedClientLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className={cn("bg-secondary py-6", state === "collapsed" && "hidden")}>
                                    <div className="flex items-center gap-2">
                                        <UserAvatar />
                                        <div className="flex flex-col">
                                            <p className="font-semibold">{session?.user?.first_name ?? "User"}</p>
                                            <p className="text-xs text-muted-foreground">{session?.user?.email ?? "User"}</p>
                                        </div>
                                    </div>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-(--radix-popper-anchor-width)" side="top">
                                <DropdownMenuItem>
                                    <LocalizedClientLink href="/account/profile">Profile</LocalizedClientLink>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <LocalizedClientLink href="/admin/settings" active="bg-primary/20 text-primary">
                                        Settings
                                    </LocalizedClientLink>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 cursor-pointer">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <LocalizedClientLink href="/api/auth/signout">Sign out</LocalizedClientLink>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
