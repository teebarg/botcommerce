"use client";

import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings, Search, User, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminMobileMenu: React.FC = () => {
    const pathname = usePathname();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
        { id: "orders", label: "Orders", icon: <ShoppingCart size={20} />, href: "/admin/orders" },
        { id: "products", label: "Products", icon: <Package size={20} />, href: "/admin/products" },
        { id: "customers", label: "Customers", icon: <Users size={20} />, href: "/admin/customers" },
        { id: "analytics", label: "Analytics", icon: <BarChart3 size={20} />, href: "/admin/analytics" },
        { id: "settings", label: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
    ];

    return (
        <div className="h-full bg-content1 rounded-[inherit] overflow-hidden">
            {/* User Profile Section */}
            <div className="p-4 bg-blue-600 text-white">
                <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div>
                        <div className="font-medium">Admin User</div>
                        <div className="text-xs text-blue-100">admin@eshop.com</div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
                <div className="relative">
                    <input
                        className="w-full py-2 pl-8 pr-4 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search..."
                        type="text"
                    />
                    <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
            </div>

            {/* Menu Items */}
            <nav className="py-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        className={`flex items-center justify-between w-full p-3 text-left hover:bg-gray-100 transition-colors ${
                            pathname === item.href ? "text-blue-600 bg-blue-50" : ""
                        }`}
                        href={item.href}
                    >
                        <div className="flex items-center space-x-3">
                            <span className={pathname === item.href ? "text-blue-600" : "text-gray-500"}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                        <ChevronRight className={pathname === item.href ? "text-blue-600" : "text-gray-400"} size={16} />
                    </Link>
                ))}
            </nav>

            {/* Logout Button */}
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
