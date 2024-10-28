"use client";

import { cn } from "@lib/util/cn";
import React, { createContext, useContext, useState } from "react";

// interface Props {}

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
                data-menu-open={expanded}
                className="flex z-40 w-full items-center justify-center data-[menu-open=true]:border-none sticky top-0 inset-x-0 backdrop-blur-lg data-[menu-open=true]:backdrop-blur-xl backdrop-saturate-150 bg-background/70 my-2 h-16"
            >
                <header className="z-40 flex px-6 gap-4 w-full flex-row relative flex-nowrap items-center justify-between h-4 max-w-full">
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
                "flex basis-0 flex-row flex-grow flex-nowrap justify-start bg-transparent items-center no-underline text-medium whitespace-nowrap box-border gap-3 max-w-fit",
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
                "gap-4 h-full flex-row flex-nowrap items-center data-[justify=start]:justify-start data-[justify=start]:flex-grow data-[justify=start]:basis-0 data-[justify=center]:justify-center data-[justify=end]:justify-end data-[justify=end]:flex-grow data-[justify=end]:basis-0 basis-1/5 sm:basis-full flex",
                className
            )}
            data-justify={justify}
        >
            {children}
        </ul>
    );
};

export const NavbarMenuItem = ({ children, className, active }: { children: React.ReactNode; className?: string; active?: boolean }) => {
    return (
        <li data-active={active} className={cn("text-large data-[active=true]:font-semibold", className)}>
            {children}
        </li>
    );
};

export const NavbarItem = ({ children, className, active }: { children: React.ReactNode; className?: string; active?: boolean }) => {
    return (
        <li data-active={active} className={cn("text-large data-[active=true]:font-semibold", className)}>
            {children}
        </li>
    );
};

export const NavbarMenu = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const context = useContext(NavbarContext);
    if (!context) throw new Error("NavbarTrigger must be used within NavbarItem");
    return (
        <React.Fragment>
            <ul
                className={cn(
                    "z-30 px-6 fixed flex max-w-full top-0 inset-x-0 bottom-0 w-screen flex-col gap-2 overflow-y-auto backdrop-blur-xl backdrop-saturate-150 bg-background/70 pt-7 h-16",
                    className
                )}
                data-open={context.expanded}
            >
                {children}
            </ul>
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
            onClick={handleClick}
            className={cn(
                "group flex items-center justify-center w-6 h-full rounded-small tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2",
                className
            )}
            type="button"
            aria-pressed={isExpanded}
            data-open={isExpanded}
        >
            <span className="w-full h-full pointer-events-none flex flex-col items-center justify-center text-inherit group-data-[pressed=true]:opacity-70 transition-opacity before:content-[''] before:block before:h-px before:w-6 before:bg-current before:transition-transform before:duration-150 before:-translate-y-1 before:rotate-0 group-data-[open=true]:before:translate-y-px group-data-[open=true]:before:rotate-45 after:content-[''] after:block after:h-px after:w-6 after:bg-current after:transition-transform after:duration-150 after:translate-y-1 after:rotate-0 group-data-[open=true]:after:translate-y-0 group-data-[open=true]:after:-rotate-45" />
        </button>
    );
};

// const Navbar2: React.FC<Props> = () => {
//     return (
//         <React.Fragment>
//             <nav className="flex z-40 w-full items-center justify-center data-[menu-open=true]:border-none sticky top-0 inset-x-0 backdrop-blur-lg data-[menu-open=true]:backdrop-blur-xl backdrop-saturate-150 bg-background/70 my-2 h-16">
//                 <header className="z-40 flex px-6 gap-4 w-full flex-row relative flex-nowrap items-center justify-between h-4 max-w-full">
//                     <ul
//                         className="gap-4 h-full flex-row flex-nowrap items-center data-[justify=start]:justify-start data-[justify=start]:flex-grow data-[justify=start]:basis-0 data-[justify=center]:justify-center data-[justify=end]:justify-end data-[justify=end]:flex-grow data-[justify=end]:basis-0 basis-1/5 sm:basis-full flex"
//                         data-justify="start"
//                     >
//                         <li className="flex basis-0 flex-row flex-grow flex-nowrap justify-start bg-transparent items-center no-underline text-medium whitespace-nowrap box-border gap-3 max-w-fit">
//                             <a className="flex justify-start items-center gap-1" href="/">
//                                 <p className="font-bold text-inherit text-2xl">Botcommerce</p>
//                             </a>
//                         </li>
//                         <div className="hidden sm:flex gap-2">
//                             <li className="text-large data-[active=true]:font-semibold">
//                                 <a className="text-base font-medium" href="/">
//                                     Home
//                                 </a>
//                             </li>
//                             <li className="text-large data-[active=true]:font-semibold">
//                                 <a className="text-base font-medium" href="/collections">
//                                     Collections
//                                 </a>
//                             </li>
//                             <li className="text-large data-[active=true]:font-semibold">
//                                 <a className="text-base font-medium" href="/cart">
//                                     Cart
//                                 </a>
//                             </li>
//                             <li className="text-large data-[active=true]:font-semibold">
//                                 <a className="text-base font-medium" href="/checkout">
//                                     Checkout
//                                 </a>
//                             </li>
//                             <li className="text-large data-[active=true]:font-semibold">
//                                 <a className="text-base font-medium" href="/admin">
//                                     Admin
//                                 </a>
//                             </li>
//                         </div>
//                     </ul>
//                     <ul
//                         className="gap-4 h-full flex-row flex-nowrap items-center data-[justify=start]:justify-start data-[justify=start]:flex-grow data-[justify=start]:basis-0 data-[justify=center]:justify-center data-[justify=end]:justify-end data-[justify=end]:flex-grow data-[justify=end]:basis-0 flex basis-1/5 sm:basis-full"
//                         data-justify="end"
//                     >
//                         <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold flex items-center">
//                             <button type="button">
//                                 <svg aria-hidden="true" focusable="false" height="30" role="presentation" viewBox="0 0 24 24" width="30">
//                                     <path
//                                         d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
//                                         fill="currentColor"
//                                     />
//                                 </svg>
//                             </button>
//                         </li>
//                         <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold hidden lg:flex">
//                             <button
//                                 type="button"
//                                 className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal overflow-hidden outline-none transition-transform-colors-opacity motion-reduce:transition-none bg-default text-default-foreground px-4 min-w-20 h-10 text-small gap-2 rounded-medium"
//                             >
//                                 <svg width="20" height="20" fill="none">
//                                     <path
//                                         stroke="currentColor"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth="1.5"
//                                         d="m16 16-3.464-3.464m0 0a5 5 0 1 0-7.072-7.072 5 5 0 0 0 7.072 7.072v0Z"
//                                     />
//                                 </svg>
//                                 Search products, brands and categories...
//                                 <kbd className="px-1.5 py-0.5 inline-flex space-x-0.5 items-center font-sans font-normal text-center text-small shadow-small bg-default-100 text-foreground-600 rounded-small">
//                                     <abbr className="no-underline" title="command">
//                                         ⌘
//                                     </abbr>
//                                     <span>K</span>
//                                 </kbd>
//                             </button>
//                         </li>
//                         <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold flex items-center pt-2">
//                             <div>
//                                 <div className="flex items-center gap-0.5">
//                                     <button className="h-full w-full flex items-center justify-center text-default-500">
//                                         <svg
//                                             aria-hidden="true"
//                                             role="img"
//                                             focusable="false"
//                                             viewBox="0 0 24 24"
//                                             width="24"
//                                             height="24"
//                                             className="h-10 w-10"
//                                         >
//                                             <path
//                                                 fill="currentColor"
//                                                 d="M2.237 2.288a.75.75 0 1 0-.474 1.423l.265.089c.676.225 1.124.376 1.453.529c.312.145.447.262.533.382c.087.12.155.284.194.626c.041.361.042.833.042 1.546v2.672c0 1.367 0 2.47.117 3.337c.12.9.38 1.658.982 2.26c.601.602 1.36.86 2.26.981c.866.117 1.969.117 3.336.117H18a.75.75 0 0 0 0-1.5h-7c-1.435 0-2.436-.002-3.192-.103c-.733-.099-1.122-.28-1.399-.556c-.235-.235-.4-.551-.506-1.091h10.12c.959 0 1.438 0 1.814-.248c.376-.248.565-.688.943-1.57l.428-1c.81-1.89 1.215-2.834.77-3.508C19.533 6 18.506 6 16.45 6H5.745a8.996 8.996 0 0 0-.047-.833c-.055-.485-.176-.93-.467-1.333c-.291-.404-.675-.66-1.117-.865c-.417-.194-.946-.37-1.572-.58zM7.5 18a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m9 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3"
//                                             />
//                                         </svg>
//                                     </button>
//                                     <div>
//                                         <div className="relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 rounded-full bg-primary text-primary-foreground h-5 text-xs">
//                                             <span className="flex-1 text-inherit font-normal px-2">20</span>
//                                         </div>
//                                         <p className="font-semibold text-sm">Cart</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </li>
//                         <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold hidden sm:flex">
//                             <button type="button" className="inline-flex items-center text-default-500 cursor-pointer outline-none">
//                                 <div className="inline-flex items-center justify-center gap-2 rounded-small outline-none transition-transform">
//                                     <span className="flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none w-10 h-10 rounded-full ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ring-default">
//                                         <img
//                                             alt="avatar"
//                                             className="flex object-cover w-full h-full"
//                                             src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
//                                         />
//                                     </span>
//                                     <div className="inline-flex flex-col items-start">
//                                         <span className="text-small text-inherit">admin</span>
//                                         <span className="text-tiny text-foreground-400">admin@email.com</span>
//                                     </div>
//                                 </div>
//                             </button>
//                         </li>
//                         <button
//                             className="group flex items-center justify-center w-6 h-full rounded-small tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 sm:hidden"
//                             type="button"
//                             aria-pressed="false"
//                         >
//                             <span className="sr-only">open navigation menu</span>
//                             <span className="w-full h-full pointer-events-none flex flex-col items-center justify-center text-inherit group-data-[pressed=true]:opacity-70 transition-opacity before:content-[''] before:block before:h-px before:w-6 before:bg-current before:transition-transform before:duration-150 before:-translate-y-1 before:rotate-0 group-data-[open=true]:before:translate-y-px group-data-[open=true]:before:rotate-45 after:content-[''] after:block after:h-px after:w-6 after:bg-current after:transition-transform after:duration-150 after:translate-y-1 after:rotate-0 group-data-[open=true]:after:translate-y-0 group-data-[open=true]:after:-rotate-45" />
//                         </button>
//                     </ul>
//                     <React.Fragment>
//                         <ul
//                             className="z-30 px-6 fixed flex max-w-full top-[var(--navbar-height)] inset-x-0 bottom-0 w-screen flex-col gap-2 overflow-y-auto backdrop-blur-xl backdrop-saturate-150 bg-background/70 pt-7"
//                             dataOpen="true"
//                         >
//                             <button
//                                 type="button"
//                                 className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal overflow-hidden outline-none transition-transform-colors-opacity motion-reduce:transition-none bg-default text-default-foreground px-4 min-w-20 h-10 text-small gap-2 rounded-medium"
//                             >
//                                 <svg width="20" height="20" fill="none">
//                                     <path
//                                         stroke="currentColor"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth="1.5"
//                                         d="m16 16-3.464-3.464m0 0a5 5 0 1 0-7.072-7.072 5 5 0 0 0 7.072 7.072v0Z"
//                                     />
//                                 </svg>
//                                 Search products, brands and categories...
//                                 <kbd className="px-1.5 py-0.5 inline-flex space-x-0.5 items-center font-sans font-normal text-center text-small shadow-small bg-default-100 text-foreground-600 rounded-small">
//                                     <abbr className="no-underline" title="command">
//                                         ⌘
//                                     </abbr>
//                                     <span>K</span>
//                                 </kbd>
//                             </button>
//                             <div className="mx-4 mt-2 flex flex-col gap-2">
//                                 <li className="text-large data-[active=true]:font-semibold" dataOpen="true">
//                                     <a className="" href="/">
//                                         Home
//                                     </a>
//                                 </li>
//                                 <li className="text-large data-[active=true]:font-semibold" dataOpen="true">
//                                     <a className="" href="/collections">
//                                         Collections
//                                     </a>
//                                 </li>
//                                 <li className="text-large data-[active=true]:font-semibold" dataOpen="true">
//                                     <a className="" href="/cart">
//                                         Cart
//                                     </a>
//                                 </li>
//                                 <li className="text-large data-[active=true]:font-semibold" dataOpen="true">
//                                     <a className="" href="/checkout">
//                                         Checkout
//                                     </a>
//                                 </li>
//                                 <li className="text-large data-[active=true]:font-semibold" dataOpen="true">
//                                     <a className="" href="/adminn">
//                                         Admin
//                                     </a>
//                                 </li>
//                                 <li className="text-large data-[active=true]:font-semibold" dataOpen="true">
//                                     <a className="" href="https://blog.niyi.com.ng">
//                                         Blog
//                                     </a>
//                                 </li>
//                             </div>
//                         </ul>
//                     </React.Fragment>
//                 </header>
//             </nav>
//         </React.Fragment>
//     );
// };
