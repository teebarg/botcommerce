"use client";

import React, { createContext, useState } from "react";

import { cn } from "@/lib/utils";

type NavbarContextType = {
    expanded: boolean;
    setExpanded: (value: boolean) => void;
};

const NavbarContext = createContext<NavbarContextType | null>(null);

export const Navbar = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <NavbarContext.Provider value={{ expanded, setExpanded }}>
            <nav
                className={cn(
                    "flex z-30 w-full items-center justify-center data-[menu-open=true]:border-none sticky top-0 inset-x-0 backdrop-blur-lg",
                    "data-[menu-open=true]:backdrop-blur-xl backdrop-saturate-150 bg-background/70 my-2 h-auto py-1.5",
                    className
                )}
                data-menu-open={expanded}
            >
                <header className="z-40 flex px-6 gap-4 w-full flex-row relative flex-nowrap items-center justify-between max-w-full">
                    {children}
                </header>
            </nav>
        </NavbarContext.Provider>
    );
};

export const NavbarBrand = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <li
            className={cn(
                "flex flex-row flex-nowrap justify-start bg-transparent items-center no-underline text-base whitespace-nowrap box-border gap-3",
                className
            )}
        >
            {children}
        </li>
    );
};

export const NavbarContent = ({ children, className, justify }: { children: React.ReactNode; className?: string; justify?: "start" | "end" }) => {
    return (
        <ul
            className={cn(
                "gap-4 h-full flex flex-nowrap items-center data-[justify=start]:justify-start",
                "data-[justify=center]:justify-center data-[justify=end]:justify-end",
                className
            )}
            data-justify={justify}
        >
            {children}
        </ul>
    );
};

export const NavbarItem = ({ children, className, active }: { children: React.ReactNode; className?: string; active?: boolean }) => {
    return (
        <li className={cn("text-lg data-[active=true]:font-semibold", className)} data-active={active}>
            {children}
        </li>
    );
};
