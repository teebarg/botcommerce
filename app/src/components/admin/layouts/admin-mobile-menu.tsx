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
import { useLocation } from "@tanstack/react-router";
import LocalizedClientLink from "@/components/ui/link";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminMobileMenu: React.FC = () => {
    const location = useLocation();

    const pathname = location.pathname;

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
        { id: "orders", label: "Orders", icon: <ClipboardList size={20} />, href: "/admin/orders" },
        { id: "gallery", label: "Gallery", icon: <Box size={20} />, href: "/admin/gallery" },
        { id: "users", label: "Customers", icon: <Users size={20} />, href: "/admin/users" },
        { id: "catalogs", label: "Catalogs", icon: <LayoutGrid size={20} />, href: "/admin/catalog" },
        { id: "categories", label: "Categories", icon: <Layers size={20} />, href: "/admin/categories" },
        { id: "collections", label: "Collections", icon: <LayoutGrid size={20} />, href: "/admin/collections" },
        { id: "abandoned-carts", label: "Abandoned Carts", icon: <ShoppingCart size={20} />, href: "/admin/abandoned-carts" },
        { id: "reviews", label: "Reviews", icon: <Star size={20} />, href: "/admin/reviews" },
        { id: "coupons", label: "Coupons", icon: <Tag size={20} />, href: "/admin/coupons" },
        { id: "settings", label: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
        { id: "activities", label: "Activities", icon: <Activity size={20} />, href: "/admin/activities" },
        { id: "chats", label: "Chats", icon: <MessageSquare size={20} />, href: "/admin/chats" },
        { id: "faqs", label: "FAQs", icon: <Notebook size={20} />, href: "/admin/faqs" },
        { id: "online", label: "Online", icon: <UsersRound size={20} />, href: "/admin/online" },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
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
            <ScrollArea className="flex-1 px-2">
                <div className="py-2">
                    {menuItems.map((item, idx: number) => (
                        <LocalizedClientLink
                            key={idx}
                            className="flex items-center justify-between w-full p-3 text-left transition-colors"
                            href={item.href}
                            active="bg-primary/20 text-primary"
                        >
                            <div className="flex items-center space-x-3">
                                <span className={pathname === item.href ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight className={pathname === item.href ? "text-primary" : "text-muted-foreground"} size={16} />
                        </LocalizedClientLink>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <button className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors w-full p-2">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminMobileMenu;
