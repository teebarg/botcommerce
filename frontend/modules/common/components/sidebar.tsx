"use client";

import React, { useState } from "react";
import { Calendar, Check, ChevronRight, CogSixTooth, Component, DocumentText, EcommerceIcon, User, Users, Window } from "nui-react-icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@lib/util/cn";
import { siteConfig } from "@/lib/config";

interface MenuItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
    exact?: boolean; // Whether to match the route exactly
}

interface SubMenuItem {
    subMenu: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    menuItems: (MenuItem | SubMenuItem)[];
}

const MenuLink = ({ href, className, children, disabled }: { href: string; className: string; children: React.ReactNode; disabled?: boolean }) => {
    if (disabled) {
        return <span className={className}>{children}</span>;
    }

    return (
        <Link className={className} href={href}>
            {children}
        </Link>
    );
};

const SubMenuComponent: React.FC<{
    item: SubMenuItem;
    level?: number;
    isCollapsed?: boolean;
}> = ({ item, isCollapsed, level = 0 }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const pathname = usePathname();
    const contentRef = React.useRef<HTMLDivElement>(null);

    const isActive = (href: string, exact = true) => (exact ? pathname === href : pathname.startsWith(href));

    const isChildActive = (items: (MenuItem | SubMenuItem)[]): boolean => {
        return items.some((subItem) => {
            if ("subMenu" in subItem) {
                return isChildActive(subItem.menuItems);
            }

            return isActive(subItem.href, subItem.exact);
        });
    };

    React.useEffect(() => {
        if (isChildActive(item.menuItems)) {
            setIsOpen(true);
        }
    }, [pathname]);

    return (
        <div className="w-full">
            <button
                aria-label="open"
                className={cn(
                    "w-full flex items-center justify-between p-4 text-default-500 hover:text-default-500",
                    "transition-colors duration-200 group",
                    {
                        "pl-4": level === 0,
                        "pl-8 hover:bg-content2 bg-content1": level === 1,
                        "pl-12 hover:bg-content2 bg-content3": level === 2,
                        "pl-16 hover:bg-content3 bg-content4": level === 3,
                    }
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {item.icon && <div className="text-inherit group-hover:text-inherit transition-colors duration-200">{item.icon}</div>}
                    <span
                        className={cn("text-sm font-medium", {
                            hidden: isCollapsed,
                        })}
                    >
                        {item.subMenu}
                    </span>
                </div>
                <div
                    className={cn("text-sm font-medium transform transition-transform duration-200", {
                        hidden: isCollapsed,
                        "rotate-90": isOpen,
                    })}
                >
                    <ChevronRight size={18} />
                </div>
            </button>

            <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-96" : "max-h-0")}>
                <div ref={contentRef}>
                    {item.menuItems.map((subItem, index) =>
                        "subMenu" in subItem ? (
                            <SubMenuComponent key={index} item={subItem as SubMenuItem} level={(level || 0) + 1} />
                        ) : (
                            <MenuItemComponent key={index} item={subItem as MenuItem} level={(level || 0) + 1} />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const MenuItemComponent: React.FC<{
    item: MenuItem;
    level?: number;
    isCollapsed?: boolean;
}> = ({ item, isCollapsed, level = 0 }) => {
    const pathname = usePathname();
    // const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    const active = pathname === item.href;

    return (
        <MenuLink
            className={cn(
                "flex items-center justify-between p-4 transition-all duration-200 group",
                item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer text-default-500 hover:text-default-500",
                {
                    "pl-4": level === 0,
                    "pl-8 hover:bg-content2 bg-content1": level === 1,
                    "pl-12 hover:bg-content2 bg-content3": level === 2,
                    "pl-16 hover:bg-content3 bg-content4": level === 3,
                    "!bg-rose-200 text-rose-800 hover:!text-rose-700": active,
                }
            )}
            href={item.href}
        >
            <div className="flex items-center gap-2">
                {item.icon && <div className="text-inherit group-hover:text-inherit transition-colors duration-200">{item.icon}</div>}
                <span
                    className={cn("text-sm font-medium", {
                        hidden: isCollapsed,
                    })}
                >
                    {item.label}
                </span>
            </div>
            {item.suffix && <div className="flex items-center">{item.suffix}</div>}
        </MenuLink>
    );
};

const SideBar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navItems: (MenuItem | SubMenuItem)[] = [
        {
            subMenu: "Admin",
            icon: <CogSixTooth size={20} />,
            menuItems: [
                {
                    label: "Dashboard",
                    href: "/admin",
                    icon: <Window size={18} />,
                },
                {
                    label: "Configs",
                    href: "/admin/configs",
                    icon: <CogSixTooth size={18} />,
                },
                {
                    label: "Users",
                    href: "/admin/users",
                    icon: <Users size={18} />,
                },
                {
                    label: "Settings",
                    href: "/admin/settings",
                    icon: <CogSixTooth size={18} />,
                },
            ],
        },
        {
            subMenu: "Store",
            icon: <EcommerceIcon size={20} />,
            menuItems: [
                {
                    label: "Products",
                    href: "/admin/products",
                },
                {
                    label: "Brands",
                    href: "/admin/brands",
                },
                {
                    label: "Categories",
                    href: "/admin/categories",
                },
                {
                    label: "Collections",
                    href: "/admin/collections",
                },
                {
                    label: "Tags",
                    href: "/admin/tags",
                },
                {
                    label: "Orders",
                    href: "/orders",
                },
                {
                    label: "Credit card",
                    href: "/credit-card",
                },
            ],
        },
        {
            subMenu: "Components",
            icon: <Component size={20} />,
            menuItems: [
                {
                    label: "Grid",
                    href: "/grid",
                    icon: <Component size={18} />,
                },
                {
                    label: "Layout",
                    href: "/layout",
                    icon: <Component size={18} />,
                },
                {
                    subMenu: "Forms",
                    icon: <Component size={18} />,
                    menuItems: [
                        {
                            label: "Input",
                            href: "/input",
                            icon: <CogSixTooth size={20} />,
                        },
                        {
                            label: "Select",
                            href: "/secret",
                            icon: <CogSixTooth size={20} />,
                        },
                        {
                            subMenu: "More",
                            icon: <CogSixTooth size={20} />,
                            menuItems: [
                                {
                                    label: "Checkbox",
                                    href: "/checkbox",
                                    icon: <Check size={18} />,
                                },
                                {
                                    label: "Radio",
                                    href: "/radio",
                                    icon: <Check size={18} />,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    const extraItems: MenuItem[] = [
        {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
            suffix: <span className="bg-pink-100 text-pink-500 text-xs font-medium px-2 py-0.5 rounded-full">New</span>,
        },
        {
            label: "Calendar",
            href: "/calendar",
            icon: <Calendar size={20} />,
            suffix: (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    New
                </span>
            ),
        },
        {
            label: "Documentation",
            href: "/documentation",
            icon: <DocumentText size={20} />,
            disabled: true,
        },
    ];

    const navs = [
        {
            group: "General",
            iems: navItems,
        },
        {
            group: "Extra",
            iems: extraItems,
        },
    ];

    return (
        <div
            className={cn(
                "h-screen bg-gradient-to-b from-default-100 via-danger-100 to-secondary-100 border-r border-default-100 flex flex-col",
                "transition-all duration-300 ease-in-out w-[22rem] text-default-500",
                {
                    "!w-20": isCollapsed,
                }
            )}
        >
            <div className="p-4 flex items-center justify-between mb-4">
                <h1
                    className={cn("font-semibold text-3xl transition-opacity duration-200 opacity-100", {
                        "!opacity-0 w-0": isCollapsed,
                    })}
                >
                    {siteConfig.name}
                </h1>
                <button
                    aria-label="open"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <ChevronRight className={cn("transform transition-transform duration-300", isCollapsed && "rotate-180")} size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {navs.map((nav, index: number) => (
                    <React.Fragment key={index}>
                        <div className={cn("px-4 mb-2 transition-opacity duration-200 mt-8 first:mt-0", isCollapsed ? "opacity-0" : "opacity-70")}>
                            <p className="text-xs font-bold text-default-500 uppercase tracking-wider">{nav.group}</p>
                        </div>

                        <nav>
                            {nav.iems.map((item, index: number) =>
                                "subMenu" in item ? (
                                    <SubMenuComponent key={index} isCollapsed={isCollapsed} item={item as SubMenuItem} />
                                ) : (
                                    <MenuItemComponent key={index} isCollapsed={isCollapsed} item={item as MenuItem} />
                                )
                            )}
                        </nav>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export { SideBar };
