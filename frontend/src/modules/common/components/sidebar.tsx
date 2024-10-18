import React, { useState } from "react";
import { Calendar, Check, ChevronDown, ChevronRight, CogSixTooth, Component, DocumentText, User, Users, Window } from "nui-react-icons";

interface MenuItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
}

interface SubMenuItem {
    subMenu: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    menuItems: (MenuItem | SubMenuItem)[];
}

const SubMenuComponent: React.FC<{
    item: SubMenuItem;
    level?: number;
}> = ({ item, level = 0 }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [height, setHeight] = useState<number>(0);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (contentRef.current) {
            setHeight(isOpen ? contentRef.current.scrollHeight : 0);
        }
    }, [isOpen]);

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between p-2 hover:bg-gray-100/50
                    transition-colors duration-200 group
                    ${level === 0 ? "pl-4" : `pl-${level * 4 + 4}`}
                    text-gray-700 hover:text-gray-900 rounded-lg
                `}
            >
                <div className="flex items-center gap-2">
                    {item.icon && <div className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">{item.icon}</div>}
                    <span className="text-sm font-medium">{item.subMenu}</span>
                </div>
                <div className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown size={18} />
                </div>
            </button>

            <div style={{ height: `${height}px` }} className="overflow-hidden transition-all duration-300 ease-in-out">
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
}> = ({ item, level = 0 }) => {
    return (
        <a
            href={item.href}
            className={`
                flex items-center justify-between p-2
                ${level === 0 ? "pl-4" : `pl-${level * 4 + 4}`}
                ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100/50 cursor-pointer"}
                text-gray-700 hover:text-gray-900 rounded-lg
                transition-all duration-200 group
            `}
        >
            <div className="flex items-center gap-2">
                {item.icon && <div className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">{item.icon}</div>}
                <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.suffix && <div className="flex items-center">{item.suffix}</div>}
        </a>
    );
};

const Sidebar: React.FC = () => {
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
                    label: "Users",
                    href: "/admin/users",
                    icon: <Users size={18} />,
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
                    subMenu: "Forms",
                    icon: <Component size={18} />,
                    menuItems: [
                        {
                            label: "Input",
                            href: "/input",
                        },
                        {
                            subMenu: "More",
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
        },
        {
            label: "Calendar",
            href: "/calendar",
            icon: <Calendar size={20} />,
            suffix: (
                <span
                    className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full
          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
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

    return (
        <div
            className={`
        h-screen bg-white border-r border-gray-200 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-80"}
      `}
        >
            <div className="p-4 flex items-center justify-between">
                <h1
                    className={`
          text-2xl font-bold text-gray-800
          transition-opacity duration-200
          ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}
        `}
                >
                    Logo
                </h1>
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <ChevronRight size={20} className={`transform transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div
                    className={`
          px-4 mb-2
          transition-opacity duration-200
          ${isCollapsed ? "opacity-0" : "opacity-70"}
        `}
                >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">General</p>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item, index) =>
                        "subMenu" in item ? (
                            <SubMenuComponent key={index} item={item as SubMenuItem} />
                        ) : (
                            <MenuItemComponent key={index} item={item as MenuItem} />
                        )
                    )}
                </nav>

                <div
                    className={`
          px-4 mb-2 mt-8
          transition-opacity duration-200
          ${isCollapsed ? "opacity-0" : "opacity-70"}
        `}
                >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Extra</p>
                </div>

                <nav className="space-y-1">
                    {extraItems.map((item, index) => (
                        <MenuItemComponent key={index} item={item} />
                    ))}
                </nav>
            </div>
        </div>
    );
};

export { Sidebar };
