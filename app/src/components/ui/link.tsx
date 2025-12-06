import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import React, { startTransition } from "react";

import { useProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

interface TransitionLinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    active?: string;
    [key: string]: any;
}

const LocalizedClientLink: React.FC<TransitionLinkProps> = ({ children, href, className, active, ...props }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    let progress = useProgressBar();

    return (
        <Link
            {...props}
            className={cn(className, pathname == href && active)}
            to={href}
            onClick={(e) => {
                e.preventDefault();
                progress.start();

                startTransition(() => {
                    navigate({ to: href.toString() });
                    progress.done();
                });
            }}
        >
            {children}
        </Link>
    );
};

export default LocalizedClientLink;
