"use client";

import { cn } from "@lib/util/cn";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useOverlay, OverlayContainer, usePreventScroll } from "@react-aria/overlays";
import { XMark } from "nui-react-icons";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@lib/hooks/use-media-query";

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
                    "flex z-40 w-full items-center justify-center data-[menu-open=true]:border-none sticky top-0 inset-x-0 backdrop-blur-lg",
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
                "flex flex-row flex-nowrap justify-start bg-transparent items-center no-underline text-medium whitespace-nowrap box-border gap-3",
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
        <li className={cn("text-large data-[active=true]:font-semibold", className)} data-active={active}>
            {children}
        </li>
    );
};

export const NavbarMenu = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const context = useContext(NavbarContext);

    if (!context) throw new Error("NavbarTrigger must be used within NavbarItem");

    const { isMobile } = useMediaQuery();

    if (!isMobile) {
        return;
    }

    return <NavbarMenuOverlay className={className}>{children}</NavbarMenuOverlay>;
};

export const NavbarMenuOverlay = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const context = useContext(NavbarContext);

    if (!context) throw new Error("NavbarTrigger must be used within NavbarItem");

    const currentPath = usePathname();

    usePreventScroll({ isDisabled: !context.expanded });

    const overlayRef = React.useRef(null);

    const { overlayProps } = useOverlay(
        {
            isOpen: context.expanded,
            shouldCloseOnBlur: true,
            isDismissable: true,
        },
        overlayRef
    );

    useEffect(() => {
        if (context.expanded) {
            // Close modal on path change
            context.setExpanded(false);
        }
    }, [currentPath]);

    return (
        <React.Fragment>
            {context.expanded && (
                <OverlayContainer>
                    <ul
                        {...overlayProps}
                        ref={overlayRef}
                        className={cn(
                            "z-50 px-6 fixed flex max-w-full top-0 inset-x-0 bottom-0 w-screen flex-col overflow-y-auto backdrop-blur-xl backdrop-saturate-150 bg-background/70 pt-12 h-screen",
                            className
                        )}
                        data-open={context.expanded}
                    >
                        <button className="absolute top-4 right-4 block" onClick={() => context.setExpanded(!context.expanded)}>
                            <XMark size={32} />
                        </button>
                        {children}
                    </ul>
                </OverlayContainer>
            )}
        </React.Fragment>
    );
};

export const NavbarMenuToggle = ({ className }: { children?: React.ReactNode; className?: string }) => {
    const context = useContext(NavbarContext);

    if (!context) throw new Error("NavbarTrigger must be used within NavbarItem");

    const isExpanded = context.expanded;

    const handleClick = () => {
        context.setExpanded(!isExpanded);
    };

    return (
        <button
            aria-pressed={isExpanded}
            className={cn(
                "group flex items-center justify-center w-6 h-full rounded-small tap-highlight-transparent outline-none data-[focus-visible=true]:z-10",
                "data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2",
                className
            )}
            data-open={isExpanded}
            type="button"
            onClick={handleClick}
        >
            <span className="w-full h-full pointer-events-none flex flex-col items-center justify-center text-inherit group-data-[pressed=true]:opacity-70 transition-opacity before:content-[''] before:block before:h-px before:w-6 before:bg-current before:transition-transform before:duration-150 before:-translate-y-1 before:rotate-0 group-data-[open=true]:before:translate-y-px group-data-[open=true]:before:rotate-45 after:content-[''] after:block after:h-px after:w-6 after:bg-current after:transition-transform after:duration-150 after:translate-y-1 after:rotate-0 group-data-[open=true]:after:translate-y-0 group-data-[open=true]:after:-rotate-45" />
        </button>
    );
};
