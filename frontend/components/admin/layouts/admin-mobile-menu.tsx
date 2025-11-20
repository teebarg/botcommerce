"use client";

import {
    LayoutDashboard,
    Users,
    Settings,
    Search,
    LogOut,
    ChevronRight,
    Notebook,
    Activity,
    MessageSquare,
    ClipboardList,
    Box,
    Layers,
    LayoutGrid,
    UsersRound,
    Star,
    ShoppingCart,
    Tag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminMobileMenu: React.FC = () => {
    const pathname = usePathname();
    const { data: session } = useSession();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
        { id: "orders", label: "Orders", icon: <ClipboardList size={20} />, href: "/admin/orders" },
        // { id: "products", label: "Products", icon: <Box size={20} />, href: "/admin/products" },
        { id: "abandoned-carts", label: "Abandoned Carts", icon: <ShoppingCart size={20} />, href: "/admin/abandoned-carts" },
        { id: "gallery", label: "Gallery", icon: <Box size={20} />, href: "/admin/gallery" },
        { id: "customers", label: "Customers", icon: <Users size={20} />, href: "/admin/users" },
        { id: "categories", label: "Categories", icon: <Layers size={20} />, href: "/admin/categories" },
        { id: "collections", label: "Collections", icon: <LayoutGrid size={20} />, href: "/admin/collections" },
        { id: "reviews", label: "Reviews", icon: <Star size={20} />, href: "/admin/reviews" },
        { id: "shared", label: "Catalog", icon: <LayoutGrid size={20} />, href: "/admin/shared" },
        { id: "coupons", label: "Coupons", icon: <Tag size={20} />, href: "/admin/coupons" },
        { id: "settings", label: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
        { id: "activities", label: "Activities", icon: <Activity size={20} />, href: "/admin/activities" },
        { id: "chats", label: "Chats", icon: <MessageSquare size={20} />, href: "/admin/chats" },
        { id: "faqs", label: "FAQs", icon: <Notebook size={20} />, href: "/admin/faqs" },
        { id: "online", label: "Online", icon: <UsersRound size={20} />, href: "/admin/online" },
    ];

    return (
        <div className="h-screen rounded-[inherit] overflow-hidden overflow-y-auto">
            <div className="p-4 bg-primary text-primary-foreground sticky top-safe z-10">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={session?.user?.image!} />
                        <AvatarFallback className="bg-secondary">{session?.user?.first_name[0] || ""}</AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="font-medium">
                            {session?.user?.first_name} {session?.user?.last_name}
                        </div>
                        <div className="text-xs text-gray-300">{session?.user?.email}</div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-b">
                <div className="relative">
                    <input
                        className="w-full py-2 pl-8 pr-4 bg-background rounded-lg text-sm focus:outline-none border"
                        placeholder="Search..."
                        type="text"
                    />
                    <Search className="absolute left-2 top-2.5 text-muted-foreground" size={16} />
                </div>
            </div>

            <nav className="py-2">
                {menuItems.map((item, idx: number) => (
                    <Link
                        key={idx}
                        prefetch
                        className={`flex items-center justify-between w-full p-3 text-left transition-colors ${
                            pathname === item.href ? "bg-primary/20 text-primary" : ""
                        }`}
                        href={item.href}
                    >
                        <div className="flex items-center space-x-3">
                            <span className={pathname === item.href ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                        <ChevronRight className={pathname === item.href ? "text-primary" : "text-muted-foreground"} size={16} />
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t sticky bottom-0 bg-background">
                <button className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors w-full p-2">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminMobileMenu;
