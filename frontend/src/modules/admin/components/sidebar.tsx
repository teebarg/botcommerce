"use client";

import React, { ReactNode } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu, sidebarClasses, MenuItemStyles, menuClasses } from "react-pro-sidebar";
import { AdminIcon, CalendarIcon, ChevronRightIcon, ComponentsIcon, DocumentIcon, EcommerceIcon, ProfileIcon } from "nui-react-icons";
import { Badge, Chip } from "@nextui-org/react";
import Link from "next/link";

interface Props {}

const Sidebar: React.FC<Props> = () => {
    const menuItemStyles: MenuItemStyles = {
        root: {
            fontSize: "14px",
            fontWeight: 400,
            color: `hsl(var(--nextui-default-500))`,
        },
        icon: {
            color: `hsl(var(--nextui-secondary))`,
            [`&.${menuClasses.disabled}`]: {
                color: `hsl(var(--nextui-secondary-500))`,
            },
        },
        SubMenuExpandIcon: {
            color: "#b6b7b9",
        },
        subMenuContent: ({ level }) => ({
            backgroundColor: level === 0 ? `hsl(var(--nextui-content1))` : `hsl(var(--nextui-content2))`,
        }),
        button: {
            [`&.${menuClasses.disabled}`]: {
                backgroundColor: `hsl(var(--nextui-warning-50))`,
            },
            "&:hover": {
                backgroundColor: `hsl(var(--nextui-content3))`,
                color: `hsl(var(--nextui-default-foreground))`,
                fontWeight: 500,
            },
            [`&.active`]: {
                backgroundColor: `hsl(var(--nextui-content4))`,
                color: `hsl(var(--nextui-default-900))`,
                fontWeight: 600,
                paddingRight: "1rem",
            },
            [`&.active svg`]: {
                display: "block",
            },
        },
        label: ({ open }) => ({
            fontWeight: open ? 600 : undefined,
        }),
    };
    const navlink = [
        {
            subMenu: "Admin",
            icon: <AdminIcon />,
            suffix: (
                <Badge content="5" color="danger" className="mr-4 -mt-0.5">
                    {""}
                </Badge>
            ),
            menuItems: [
                {
                    label: "Dashboad",
                    href: "/admin",
                },
                {
                    label: "Settings",
                    href: "/admin/settings",
                },
                {
                    label: "Users",
                    href: "/admin/users",
                },
            ],
        },
        {
            subMenu: "Components",
            icon: <ComponentsIcon />,
            menuItems: [
                {
                    label: "Grid",
                    href: "/grid",
                },
                {
                    label: "Layout",
                    href: "/layout",
                },
                {
                    subMenu: "Forms",
                    menuItems: [
                        {
                            label: "Input",
                            href: "/input",
                        },
                        {
                            label: "Select",
                            href: "/select",
                        },
                        {
                            subMenu: "More",
                            menuItems: [
                                {
                                    label: "CheckBox",
                                    href: "/checkbox",
                                },
                                {
                                    label: "Radio",
                                    href: "/radio",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            subMenu: "E-commerce",
            icon: <EcommerceIcon />,
            menuItems: [
                {
                    label: "Products",
                    href: "/admin/products",
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
    ];

    const section2 = [
        {
            label: "Profile",
            href: "/profile",
            icon: <ProfileIcon />,
        },
        {
            label: "Calendar",
            href: "/calendar",
            icon: <CalendarIcon />,
            suffix: (
                <Chip color="success" variant="flat" size="sm">
                    New
                </Chip>
            ),
        },
        {
            label: "Documentation",
            href: "/documentation",
            icon: <DocumentIcon />,
            disabled: true,
        },
    ];

    interface MenuItem {
        label: string;
        href: string;
    }
    type SubMenu = {
        subMenu: string;
        icon?: ReactNode;
        suffix?: ReactNode;
        menuItems: (MenuItem | SubMenu)[];
    };

    const menuItems = (item: (MenuItem | SubMenu)[]) => {
        return item.map((menuItem: MenuItem | SubMenu, index: number) => {
            if ("subMenu" in menuItem) {
                return (
                    <SubMenu key={index} label={menuItem.subMenu} icon={menuItem.icon}>
                        {menuItems(menuItem.menuItems)}
                    </SubMenu>
                );
            }
            return (
                <MenuItem
                    key={index}
                    component={<Link href={menuItem.href} />}
                    suffix={<ChevronRightIcon strokeWidth={2.5} width="2em" height="2em" className="hidden" />}
                >
                    {menuItem.label}
                </MenuItem>
            );
        });
    };

    return (
        <ProSidebar
            className="bg-gradient-to-b from-default-100 via-danger-100 to-secondary-100"
            rootStyles={{
                [`.${sidebarClasses.container}`]: {
                    background: "inherit",
                    height: "100vh",
                    minWidth: "20rem",
                    overflowY: "auto",
                },
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div className="flex-1 mb-8 py-4">
                    <h1 className="text-3xl pl-4 mb-8">RFT</h1>
                    <div className="px-6 mb-2">
                        <p className="font-semibold" style={{ opacity: 0.7, letterSpacing: "0.5px" }}>
                            General
                        </p>
                    </div>
                    <Menu menuItemStyles={menuItemStyles}>{menuItems(navlink)}</Menu>

                    <div className="py-0 px-6 mb-2 mt-8">
                        <p className="font-semibold" style={{ opacity: 0.7, letterSpacing: "0.5px" }}>
                            Extra
                        </p>
                    </div>

                    <Menu menuItemStyles={menuItemStyles}>
                        {section2.map((menuItem, index) => (
                            <MenuItem
                                key={index}
                                icon={menuItem.icon}
                                suffix={menuItem.suffix}
                                disabled={menuItem.disabled}
                                component={<Link href={menuItem.href} />}
                            >
                                {menuItem.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
            </div>
        </ProSidebar>
    );
};

export default Sidebar;
