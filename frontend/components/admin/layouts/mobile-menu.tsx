"use client";

import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    Search,
    LogOut,
    ChevronRight,
    Notebook,
    Image,
    Activity,
    MessageSquare,
    User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocumentText } from "nui-react-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";

const AdminMobileMenu: React.FC = () => {
    const pathname = usePathname();

    const { user } = useAuth();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
        { id: "orders", label: "Orders", icon: <ShoppingCart size={20} />, href: "/admin/orders" },
        { id: "products", label: "Products", icon: <Package size={20} />, href: "/admin/products" },
        { id: "customers", label: "Customers", icon: <Users size={20} />, href: "/admin/users" },
        { id: "categories", label: "Categories", icon: <Image size={20} />, href: "/admin/categories" },
        { id: "reviews", label: "Reviews", icon: <Notebook size={20} />, href: "/admin/reviews" },
        { id: "settings", label: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
        { id: "carousel", label: "Carousel", icon: <Image size={20} />, href: "/admin/carousel" },
        { id: "activities", label: "Activities", icon: <Activity size={20} />, href: "/admin/activities" },
        { id: "chats", label: "Chats", icon: <MessageSquare size={20} />, href: "/admin/chats" },
        { id: "faqs", label: "FAQs", icon: <DocumentText size={20} />, href: "/admin/faqs" },
        { id: "online", label: "Online", icon: <User size={20} />, href: "/admin/online" },
    ];

    return (
        <div className="h-full bg-content1 rounded-[inherit] overflow-hidden overflow-y-auto">
            <div className="p-4 bg-primary text-white">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={user?.image} />
                        <AvatarFallback className="bg-secondary">{user?.first_name[0] || ""}</AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="font-medium">
                            {user?.first_name} {user?.last_name}
                        </div>
                        <div className="text-xs text-blue-100">{user?.email}</div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-b border-content2">
                <div className="relative">
                    <input
                        className="w-full py-2 pl-8 pr-4 bg-content1 rounded-lg text-sm focus:outline-none border"
                        placeholder="Search..."
                        type="text"
                    />
                    <Search className="absolute left-2 top-2.5 text-default-500" size={16} />
                </div>
            </div>

            <nav className="py-2">
                {menuItems.map((item, idx: number) => (
                    <Link
                        key={idx}
                        className={`flex items-center justify-between w-full p-3 text-left transition-colors ${
                            pathname === item.href ? "text-blue-600 bg-background" : ""
                        }`}
                        href={item.href}
                    >
                        <div className="flex items-center space-x-3">
                            <span className={pathname === item.href ? "text-blue-600" : "text-default-500"}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                        <ChevronRight className={pathname === item.href ? "text-blue-600" : "text-default-500"} size={16} />
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-content2 sticky bottom-0 bg-content1">
                <button className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors w-full p-2">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminMobileMenu;
