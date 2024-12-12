"use client";

import { cn } from "@lib/util/cn";
import React, { useState } from "react";
import { HomeIcon, User } from "nui-react-icons";


export const BottomNavbar = ({ className }: { className?: string }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <nav className={cn("flex z-40 w-full items-center justify-center sticky top-0 inset-x-0 my-2 h-auto py-1.5", className)}>
            <div>
                <HomeIcon />
                <p>Home</p>
            </div>
            <div>
                <HomeIcon />
                <p>Categories</p>
            </div>
            <div>
                <User />
                <p>Account</p>
            </div>
            <div>
                <HomeIcon />
                <p>Help</p>
            </div>
        </nav>
    );
};
