"use client";

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
import { Home, Settings, Users, Package, Menu, ChevronUp, LogOut, PanelLeftIcon, User, Box, Star, Activity, MessageSquare } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useStoreSettings } from "@/providers/store-provider";
import { DocumentText } from "nui-react-icons";

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
        icon: DocumentText,
    },
    {
        title: "Online",
        url: "/admin/online",
        icon: User,
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
        url: "/profile",
        icon: User,
    },
];

const storeItems = [
    {
        title: "Products",
        url: "/admin/products",
        icon: Package,
    },
    {
        title: "Orders",
        url: "/admin/orders",
        icon: Box,
    },
    {
        title: "Reviews",
        url: "/admin/reviews",
        icon: Star,
    },
    {
        title: "Brands",
        url: "/admin/brands",
        icon: Package,
    },
    {
        title: "Categories",
        url: "/admin/categories",
        icon: Package,
    },
    {
        title: "Collections",
        url: "/admin/collections",
        icon: Package,
    },
    {
        title: "Shared Collections",
        url: "/admin/shared",
        icon: Package,
    },
];

export function AdminSidebar() {
    const { user } = useAuth();
    const { settings } = useStoreSettings();
    const { toggleSidebar, state } = useSidebar();
    const path = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <PanelLeftIcon onClick={toggleSidebar} />
                            <p className="ml-2 text-2xl font-semibold">{settings?.shop_name}</p>
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
                                    <SidebarMenuButton asChild isActive={path === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
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
                                    <SidebarMenuButton asChild isActive={path === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
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
                                    <SidebarMenuButton asChild isActive={path === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
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
                                <SidebarMenuButton className={cn("bg-accent py-6", state === "collapsed" && "hidden")}>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8 cursor-pointer">
                                            <AvatarImage src={user?.image ?? undefined} alt={user?.first_name ?? "User"} />
                                            <AvatarFallback className="bg-green-600 text-white text-xs">
                                                {user?.first_name
                                                    ?.split(" ")
                                                    .map((n) => n[0])
                                                    .join("") ?? "ME"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <p className="font-semibold">{user?.first_name ?? "User"}</p>
                                            <p className="text-xs text-gray-500">{user?.email ?? "User"}</p>
                                        </div>
                                    </div>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                                <DropdownMenuItem>
                                    <Link href="/profile" className="justify-between">
                                        Profile
                                        <span className="badge">New</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 cursor-pointer">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <Link href="/api/auth/signout">Sign out</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
